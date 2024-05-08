import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { SelectControl, PanelBody, ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
    const { selectedTaxonomy, outputVariant, includeLinks } = attributes;
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
        { value: 'flex', label: __( 'Flexible Blocks', 'taxonomy-list-block' ) },
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
                <div className="flex-container">
                    { terms.map( ( term ) => (
                        <div key={ term.id } className="flex-item">
                            { includeLinks ? <a href={ term.link }>{ term.name }</a> : term.name }
                        </div>
                    ) ) }
                </div>
            );
        }
    };

    return (
        <div { ...useBlockProps() }>
            <InspectorControls group="settings">
                <PanelBody title={ __( 'Taxonomy Settings', 'taxonomy-list-block' ) }>
                    <SelectControl
                        label={ __( 'Select a taxonomy', 'taxonomy-list-block' ) }
                        value={ selectedTaxonomy }
                        options={ taxonomyOptions }
                        onChange={ ( value ) => {
                            setAttributes( { selectedTaxonomy: value } );
                            editPost( { meta: { _selectedTaxonomy: value } } );
                        } }
                    />
                    <SelectControl
                        label={ __( 'Output Variant', 'taxonomy-list-block' ) }
                        value={ outputVariant }
                        options={ outputVariantOptions }
                        onChange={ ( value ) => {
                            setAttributes( { outputVariant: value } );
                        } }
                    />
                    <ToggleControl
                        label={ __( 'Include Links', 'taxonomy-list-block' ) }
                        checked={ includeLinks }
                        onChange={ ( value ) => {
                            setAttributes( { includeLinks: value } );
                        } }
                    />
                </PanelBody>
            </InspectorControls>
            { renderTerms() }
        </div>
    );
}