<?php
/**
 * Plugin Name:       Taxonomy List Block
 * Description:       Implementation of dynamic Gutenberg block with support of the terms output from the custom or standard taxonomy
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.9.0
 * Author:            Andrew Tsyhaniuk <in0mad91@gmail.com>
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       taxonomy-list-block
 * Domain Path:       /languages
 * Tags:              block, gutenberg, taxonomy, terms, list
 *
 * @package taxonomy-list-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_taxonomy_list_block_block_init(): void {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'create_block_taxonomy_list_block_block_init' );