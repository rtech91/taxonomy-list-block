<p <?php echo get_block_wrapper_attributes(); ?>>
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

	// Start output buffering
	ob_start();

	// Check if terms exist
	if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
		if ($outputVariant === 'list') {
			echo '<ul>';
		} else {
			echo '<div class="flex-container">';
		}

		// Loop through each term and output it
		foreach ( $terms as $term ) {
			if ($outputVariant === 'list') {
				echo '<li>';
			} else {
				echo '<div class="flex-item">';
			}

			if ($includeImage) {
				$image = get_term_meta($term->term_id, $imageFieldName, true);
				if ($image && is_numeric( $image)) {
                    echo wp_get_attachment_image($image, 'thumbnail');
				} else if( $image ) {
					echo '<img src="' . esc_url($image) . '" alt="' . esc_attr($term->name) . '">';
				}
			}

			if ($includeLinks) {
				echo '<a href="' . get_term_link($term) . '">' . $term->name . '</a>';
			} else {
				echo $term->name;
			}

			if ($outputVariant === 'list') {
				echo '</li>';
			} else {
				echo '</div>';
			}
		}

		if ($outputVariant === 'list') {
			echo '</ul>';
		} else {
			echo '</div>';
		}
	} else {
		echo '<p>' . esc_html__( 'No terms found for this taxonomy.', 'taxonomy-list-block' ) . '</p>';
	}

	// Get the buffered content
	echo ob_get_clean();
	?>
</p>