<?php
	$selectedTaxonomy = $attributes['selectedTaxonomy'];
	$outputVariant = $attributes['outputVariant'];
	$includeLinks = $attributes['includeLinks'];
	$includeImage = $attributes['includeImage'];
	$imageFieldName = $attributes['imageFieldName'];

	// Get terms of the selected taxonomy
	$terms = get_terms( array(
		'taxonomy' => $selectedTaxonomy,
		'hide_empty' => false,
	) );

    $content = '<div ' . get_block_wrapper_attributes() . '>';

	// Check if terms exist
	if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
		if ($outputVariant === 'list') {
			$content .= '<ul>';
		}

		// Loop through each term and output it
		foreach ( $terms as $term ) {
			if ($outputVariant === 'list') {
				$content .= '<li>';
			} else {
				$content .= '<div class="flex-item">';
			}

			if ($includeImage) {
				$image = get_term_meta($term->term_id, $imageFieldName, true);
				if ($image && is_numeric( $image)) {
                    $content .= wp_get_attachment_image($image, 'thumbnail');
				} else if( $image ) {
					$content .= '<img src="' . esc_url($image) . '" alt="' . esc_attr($term->name) . '">';
				}
			}

			if ($includeLinks) {
				$content .= '<a href="' . get_term_link($term) . '">' . $term->name . '</a>';
			} else {
				$content .= $term->name;
			}

			if ($outputVariant === 'list') {
				$content .= '</li>';
			} else {
				$content .= '</div>';
			}
		}

		if ($outputVariant === 'list') {
			$content .= '</ul>';
		} else {
			$content .= '</div>';
		}
        echo $content;
	} else {
		echo esc_html__( 'No terms found for this taxonomy.', 'taxonomy-list-block' ) . '</div>';
	}