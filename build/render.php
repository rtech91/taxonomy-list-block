<?php
$selectedTaxonomy = $attributes['selectedTaxonomy'];
$outputVariant = $attributes['outputVariant'];
$includeLinks = $attributes['includeLinks'];
$includeImage = $attributes['includeImage'];
$imageFieldName = $attributes['imageFieldName'];
$setAsBackground = $attributes['setAsBackground'];
$parentTermId = $attributes['parentTermId'];

// Get terms of the selected taxonomy
$terms = get_terms(array(
	'taxonomy' => $selectedTaxonomy,
	'parent' => $parentTermId,
	'hide_empty' => false,
));
$terms = array_reverse($terms);
$content = '<div ' . get_block_wrapper_attributes() . '>';

// Check if terms exist
if (!empty($terms) && !is_wp_error($terms)) {
	if ($outputVariant === 'list') {
		$content .= '<ul>';
	}

	// Loop through each term and output it
	foreach ($terms as $term) {
		if ($outputVariant === 'list') {
			$content .= '<li>';
		} else {
			if ($includeImage && $setAsBackground) {
				$image = get_term_meta($term->term_id, $imageFieldName, true);
				if ($image && is_numeric($image)) {
					$content .= '<div class="flex-item" style="background-image: url(' . wp_get_attachment_image_url($image, 'full') . '); background-size: cover;">';
				} else if ($image && is_string($image)) {
					$content .= '<div class="flex-item" style="background-image: url(' . esc_url($image) . '); background-size: cover;">';
				}
			} else {
				$content .= '<div class="flex-item">';
			}
		}

		if ($includeImage && !$setAsBackground) {
			$image = get_term_meta($term->term_id, $imageFieldName, true);
			if ($image && is_numeric($image)) {
				$content .= wp_get_attachment_image($image, 'full');
			} else if ($image && is_string($image)) {
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
	echo esc_html__('No terms found for this taxonomy.', 'taxonomy-list-block') . '</div>';
}