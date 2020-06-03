#!/usr/bin/perl
#
# Authors:
#      Nick Fagerlund <nick.fagerlund@gmail.com>
#
# Copyright (c) 2020 by Dreamwidth Studios, LLC.
#
# This program is free software; you may redistribute it and/or modify it under
# the same terms as Perl itself. For a copy of the license, please reference
# 'perldoc perlartistic' or 'perldoc perlgpl'.

package DW::Formats;

use strict;

our @active_formats = qw( html_casual1 markdown0 html_raw0 );
our $default_format = 'html_casual1';
our %formats        = (
    html_casual0 => {
        id   => 'html_casual0',
        name => "Casual HTML (legacy 0)",
        description =>
"Text with normal line breaks, plus HTML tags for formatting. Doesn't support \@mentions.",
    },
    html_casual1 => {
        id   => 'html_casual1',
        name => "Casual HTML",
        description =>
            "Text with normal line breaks, plus \@mentions and HTML tags for formatting.",
    },
    html_raw0 => {
        id   => 'html_raw0',
        name => "Raw HTML",
        description =>
"Pre-formatted HTML. Doesn't automatically detect paragraph breaks, and doesn't support \@mentions.",
    },
    html_extra_raw => {
        id   => 'html_extra_raw',
        name => "Raw HTML (external source)",
        description =>
"Pre-formatted HTML from a feed or some other external source. Doesn't support special Dreamwidth tags like &lt;user&gt;.",
    },
    markdown0 => {
        id   => 'markdown0',
        name => "Markdown",
        description =>
"Markdown, a lightweight text format that makes paragraphs from normal line breaks and provides shortcuts for the most common HTML tags. Supports \@mentions, and supports real HTML tags for more complex formatting.",
    },
);

# Legacy aliases:
$formats{markdown} = $formats{markdown0};

# $formats{html} = $formats{html_casual1}; # probably not used anywhere?

# Builds items that can be passed to an LJ::html_select for picking a format.
# Args: opts hash with the $current format (if editing) and the user's $preferred format.
# Returns: Hashref like {selected => "format", items => [...]}. (Unfortunately,
# LJ::html_select doesn't support just setting selected=true on one of the items,
# so we need to return an extra value.)
sub select_items {
    my %opts = @_;

    # Canonicalize em
    my $current   = validate( $opts{current} );
    my $preferred = validate( $opts{preferred} );

    my @formats  = @active_formats;
    my $selected = $default_format;

    # Use the content's existing format if possible, then fall back to the
    # user's preference (IF it's one of the active ones), then the site default.
    if ($current) {
        push( @formats, $current ) unless grep( $_ eq $current, @formats );
        $selected = $current;
    }
    elsif ( $preferred && grep( $_ eq $preferred, @active_formats ) ) {
        $selected = $preferred;
    }

    return {
        selected => $selected,
        items =>
            [ map { { value => $formats{$_}->{id}, text => $formats{$_}->{name}, } } @formats ],
    };
}

# Return the canonical version of the provided format ID if valid, empty string if not.
sub validate {
    my $format = shift;
    if ( $formats{$format} ) {
        return $formats{$format}->{id};
    }
    else {
        return '';
    }
}
