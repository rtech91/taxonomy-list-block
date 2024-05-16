import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { SelectControl, PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
    const { selectedTaxonomy, outputVariant, includeLinks, includeImage, imageFieldName, setAsBackground } = attributes;
    const { editPost } = useDispatch( 'core/editor' );
    const [ taxonomies, setTaxonomies ] = useState( [] );
    const [ terms, setTerms ] = useState( [] );

    // Fetch taxonomies
    useEffect( () => {
        wp.apiFetch( { path: '/wp/v2/taxonomies' } ).then( ( data ) => {
            setTaxonomies( data );
        } );
    }, [] );

    // Fetch terms when selectedTaxonomy changes
    useEffect( () => {
        if ( selectedTaxonomy ) {
            wp.apiFetch( { path: `/wp/v2/${ selectedTaxonomy }` } ).then( ( data ) => {
                setTerms( data );
            } );
        }
    }, [ selectedTaxonomy ] );

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
                        label={__('Output Variant', 'taxonomy-list-block')}
                        value={outputVariant}
                        options={outputVariantOptions}
                        onChange={(value) => {
                            setAttributes({outputVariant: value});
                        }}
                    />
                    <ToggleControl
                        label={__('Include Links', 'taxonomy-list-block')}
                        checked={includeLinks}
                        onChange={(value) => {
                            setAttributes({includeLinks: value});
                        }}
                    />
                    {outputVariant === 'flex' && (
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