import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { SelectControl, PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
    const { selectedTaxonomy, outputVariant, includeLinks, includeImage, imageFieldName, setAsBackground, parentTermId, contextTermId } = attributes;
    const { editPost } = useDispatch( 'core/editor' );
    const [ taxonomies, setTaxonomies ] = useState( [] );
    const [ terms, setTerms ] = useState( [] );
    const [ parentTerms, setParentTerms ] = useState( [] );
    const [ isACFActive, setIsACFActive ] = useState( false );

    // Fetch taxonomies
    useEffect( () => {
        wp.apiFetch( { path: '/wp/v2/taxonomies' } ).then( ( data ) => {
            setTaxonomies( data );
        } );
    }, [] );

    // Transform flat array to hierarchical
    const transformToHierarchical = (arr, parent = 0, tree = []) => {
        arr.filter(({ parent: id }) => id === parent)
            .forEach(({ id, ...rest }) => tree.push({ id, ...rest, children: transformToHierarchical(arr, id) }));
        return tree;
    };

    // Check if ACF plugin is active
    const isACFPluginActive = async function () {
        /* @type {Promise<boolean>} */
        const plugins = await wp.apiFetch({
            path: '/wp/v2/plugins'
        });

        return plugins.some(plugin => plugin.plugin === 'advanced-custom-fields/acf' && plugin.status === 'active');
    };

    useEffect(() => {
        isACFPluginActive().then((result) => {
            setIsACFActive(result);
        });
    } , [ isACFActive ]);


    // Fetch terms when selectedTaxonomy changes
    useEffect( () => {
        if ( selectedTaxonomy ) {
            wp.apiFetch( { path: `/wp/v2/${ selectedTaxonomy }` } ).then( ( data ) => {
                const hierarchicalData = transformToHierarchical(data);
                setParentTerms( hierarchicalData )
            } );
        }
    }, [ selectedTaxonomy ] );

    useEffect( () => {
        if ( selectedTaxonomy ) {
            if (parentTermId === -1) {
                const termId = contextTermId || window.location.pathname.split('/').pop();
                let field = 'slug';
                if (contextTermId) {
                    field = 'parent';
                }
                wp.apiFetch( { path: `/wp/v2/${ selectedTaxonomy }?${ field }=${termId}` } ).then( ( data ) => {
                    setTerms( data );
                } );
            } else {
                wp.apiFetch( { path: `/wp/v2/${ selectedTaxonomy }?parent=${parentTermId}` } ).then( ( data ) => {
                    setTerms( data );
                } );
            }
        }
    }, [ selectedTaxonomy, parentTermId, contextTermId ] );

    const generateTermOptions = (terms, depth = 0) => {
        let options = [];

        terms.forEach((term) => {
            options.push({ value: term.id, label: '- '.repeat(depth) + term.name });

            if (term.children) {
                options = options.concat(generateTermOptions(term.children, depth + 1));
            }
        });

        return options;
    };

    const taxonomyOptions = Object.keys( taxonomies ).map( ( key ) => {
        return { value: key, label: taxonomies[ key ].name };
    } );

    const outputVariantOptions = [
        { value: 'list', label: __( 'List', 'taxonomy-list-block' ) },
        { value: 'flex', label: __( 'Flex Blocks', 'taxonomy-list-block' ) },
    ];

    const renderTerms = () => {
        if (outputVariant === 'list') {
            return (
                <ul>
                    { terms.map( ( term ) => (
                        <li key={ term.id }>
                            { includeLinks ? <a href={ term.link }>{ term.name }</a> : term.name }
                        </li>
                    ) ) }
                </ul>
            );
        } else {
            return (
                terms.map( ( term ) => (
                    <div key={ term.id } className="flex-item">
                        { includeImage && term[imageFieldName] && <img src={ term[imageFieldName] } alt={ term.name } /> }
                        { includeLinks ? <a href={ term.link }>{ term.name }</a> : term.name }
                    </div>
                ) )
            );
        }
    };

    return (
        <div {...useBlockProps({style: outputVariant === 'flex' ? {display: 'flex'} : {}})}>
            <InspectorControls>
                <PanelBody title={__('Taxonomy Settings', 'taxonomy-list-block')}>
                    <SelectControl
                        label={__('Select a taxonomy', 'taxonomy-list-block')}
                        value={selectedTaxonomy}
                        options={taxonomyOptions}
                        onChange={(value) => {
                            setAttributes({selectedTaxonomy: value});
                            editPost({meta: {_selectedTaxonomy: value}});
                        }}
                    />
                    <SelectControl
                        label={__('Select a parent term', 'taxonomy-list-block')}
                        value={parentTermId}
                        options={[
                            { value: 0, label: __('All', 'taxonomy-list-block') },
                            { value: -1, label: __('Use context', 'taxonomy-list-block') },
                            ...generateTermOptions(parentTerms)
                        ]}
                        onChange={(value) => {
                            // if value is not equal to -1 - set contextTermId to 0
                            if (value !== -1) {
                                setAttributes({contextTermId: 0});
                            }

                            setAttributes({parentTermId: parseInt(value, 10)});
                        }}
                    />
                    <SelectControl
                        label={__('Select a context term (Debugging)', 'taxonomy-list-block')}
                        value={contextTermId}
                        options={[
                            { value: 0, label: __('None', 'taxonomy-list-block') },
                            ...generateTermOptions(parentTerms)
                        ]}
                        onChange={(value) => {
                            setAttributes({contextTermId: parseInt(value, 10)});
                        }}
                    />
                    <SelectControl
                        label={__('Output Variant', 'taxonomy-list-block')}
                        value={outputVariant}
                        options={outputVariantOptions}
                        onChange={(value) => {
                            setAttributes({outputVariant: value});

                            // re-check if ACF is active
                            isACFPluginActive().then((result) => {
                                setIsACFActive(result);
                            });
                            
                        }}
                    />
                    <ToggleControl
                        label={__('Include Links', 'taxonomy-list-block')}
                        checked={includeLinks}
                        onChange={(value) => {
                            setAttributes({includeLinks: value});
                        }}
                    />
                    {outputVariant === 'flex' && isACFActive && (
                        <>
                            <ToggleControl
                                label={__('Include Image', 'taxonomy-list-block')}
                                checked={includeImage}
                                onChange={(value) => {
                                    setAttributes({includeImage: value});
                                }}
                            />
                            {includeImage && (
                                <TextControl
                                    label={__('Image Field Name', 'taxonomy-list-block')}
                                    value={imageFieldName}
                                    onChange={(value) => {
                                        setAttributes({imageFieldName: value});
                                    }}
                                />
                            )}
                            {includeImage && (
                                <ToggleControl
                                    label={__('Set as background image', 'taxonomy-list-block')}
                                    checked={setAsBackground}
                                    onChange={(value) => {
                                        setAttributes({setAsBackground: value});
                                    }}
                                />
                            )}
                        </>
                    )}
                </PanelBody>
            </InspectorControls>
            {renderTerms()}
        </div>
    );
}