// TODO: Wrap everything in a ( function() { } )(); ???

var writer = new CKEDITOR.htmlWriter();
writer.indentationChars = '  ';
var dtd = CKEDITOR.dtd;
[ 'raw-code', 'poll-item', 'poll-question', 'poll', 'cut', 'site-embed' ].forEach( function (e) {
    dtd[e] = dtd.div;
    dtd.$block[e] = 1;
    dtd.body[e] = 1;
});
for ( var e in CKEDITOR.tools.extend( {}, dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent ) ) {
    writer.setRules( e, {
        indent: true,
        breakBeforeOpen: true,
        breakAfterOpen: true,
        breakBeforeClose: true,
        breakAfterClose: false
    });
}


CKEDITOR.plugins.add( 'dwformat', {
    init: function( editor ) {

        function makecut( element ) {
            element.name = 'div';
            element.attributes.class = 'cuttag-open';
            element.attributes.contenteditable = "false";
            var title = new CKEDITOR.htmlParser.element( 'div' );
            title.attributes.contenteditable = "false";
            title.attributes.class = 'title';
            if ( ! element.attributes.text )
                element.attributes.text = "Read more...";
            title.setHtml( "<span contenteditable=\"false\">" + element.attributes.text + "</span>" );
            delete element.attributes.text;
            var content = new CKEDITOR.htmlParser.element( 'div' );
            content.attributes.class = 'content';
            content.setHtml(element.getHtml());
            element.setHtml("");
            element.children = [ title, content ];
        };
        function makepoll( element ) {
            element.name = 'div';
            element.attributes.class = 'ljpoll';
        };
        function makepollquestion( element ) {
            element.name = 'div';
            element.attributes.class = 'ljpoll-question';
        };
        function makepollitem( element ) {
            element.name = 'div';
            element.attributes.class = 'ljpoll-item';
        };
        function makerawcode( element ) {
            element.name = 'div';
            element.attributes.class = 'raw-code';
        };
        function makesiteembed( element ) {
            element.name = 'div';
            element.attributes.class = 'ljembed';
        }
        function makeuser( element ) {
            if ( ! element.attributes.name ) {
                return;
            }
            var name = new CKEDITOR.htmlParser.element( 'strong' );
            name.setHtml( element.attributes.name );

            var link = new CKEDITOR.htmlParser.element( 'a' );
            link.attributes.href = site_p.siteroot.replace( 'www', element.attributes.name );
            link.children = [ name ];

            var img = new CKEDITOR.htmlParser.element( 'img' );
            img.isEmpty = true;
            img.attributes.width = "17";
            img.attributes.height = "17";
            img.attributes.style = "vertical-align: text-bottom; border: 0; padding-right: 1px;";
            img.attributes.alt = "[personal profile] "
            img.attributes.src = site_p.imgprefix + "/silk/identity/user.png";

            element.name = 'span';
            element.attributes.class = 'ljuser';
            element.children = [ img, link ];
            element.attributes.contenteditable = "false";
        };

        var dwcodeFilter = new CKEDITOR.htmlParser.filter( {
            elements: {
                cut: makecut,
                'lj-cut': makecut,
                poll: makepoll,
                'lj-poll': makepoll,
                'poll-question': makepollquestion,
                'lj-pq': makepollquestion,
                'poll-item': makepollitem,
                'lj-pi': makepollitem,
                'raw-code': makerawcode,
                'lj-raw': makerawcode,
                'user': makeuser,
                'lj': makeuser,
                'site-embed': makesiteembed,
                'lj-embed': makesiteembed
            }
        });

        function DWCodeToHtml( code ) {
            // Auto-close any <user name="foo"> and <lj name="foo"> tags
            c = code.replace( /(\<user [^/>]*)\/?\>/g, '$1></user>' );
            c = c.replace( /(\<lj [^/>]*)\/?\>/g, '$1></lj>' );
            // Handle processed <poll-###> tags
            c = c.replace( /\<poll-([0-9]+)\>([^<]*)\<\/poll-[0-9]+\>/g, '<poll id=$1></poll>' );
            // Handle auto-formatting for newlines
            if ( !$("#preformatted").is(":checked") ) {
                c = c.replace(/\n/g, '<br />\n');
            }
            c = c.replace(/\n/g, '');

            var fragment = CKEDITOR.htmlParser.fragment.fromHtml( c ),
                writer = new CKEDITOR.htmlParser.basicWriter();
            fragment.writeHtml( writer, dwcodeFilter );
            return writer.getHtml( true );
        }


        // Used whenever the editor dumps its output to source or on POST
        // In effect, our HtmlToDWCode filter
        editor.dataProcessor.htmlFilter.addRules( {
            elements: {
                div: function( element ) {
                    if ( element.hasClass( 'cuttag-open' ) ) {
                        element.name = 'cut';
                        element.removeClass( 'cuttag-open' );
                        var content = "";
                        element.children.forEach( function( c ) {
                            if ( c instanceof CKEDITOR.htmlParser.element ) {
                                if ( c.hasClass( 'title' ) ) {
                                    c.children.forEach( function ( e ) {
                                        if ( e instanceof CKEDITOR.htmlParser.element && e.name == 'span' ) {
                                            element.attributes['text'] = e.getHtml(); 
                                        }
                                    });
                                } else if ( c.hasClass( 'content' ) ) {
                                    content = c.getHtml();
                                }
                            }
                        });
                        element.children = [];
                        element.setHtml( content );
                    } else if ( element.hasClass( 'ljembed' ) ) {
                        element.name = 'site-embed'; 
                        element.removeClass( 'ljembed' );
                    } else if ( element.hasClass( 'ljpoll' ) ) {
                        if ( element.attributes['id'] ) {
                            element.name = "poll-" + element.attributes['id'];
                            delete element.attributes.id;
                        } else {
                            element.name = 'poll';
                        }
                        element.removeClass( 'ljpoll' );
                    } else if ( element.hasClass( 'ljpoll-question' ) ) {
                        element.name = 'poll-question';
                        element.removeClass( 'ljpoll-question' );
                    } else if ( element.hasClass( 'ljpoll-item' ) ) {
                        element.name = 'poll-item';
                        element.removeClass( 'ljpoll-item' );
                    } else if ( element.hasClass( 'raw-code' ) ) {
                        element.name = 'raw-code';
                        element.removeClass( 'raw-code' );
                    }
                },
                span: function( element ) {
                    if ( element.hasClass( 'ljuser' ) && !element.attributes['site'] ) {
                        element.name = 'user';
                        element.removeClass( 'ljuser' );
                        element.children = [ ];
                        element.isEmpty = true;
                    } else if ( element.hasClass( 'ljuser' ) ) {
                        element.name = 'div';
                    }
                }
            }
        }, 1);

        editor.dataProcessor.writer = writer;

        function onSetData( evt ){
            // Called when going from source -> wysiwyg
            // as well as on initial editor init
            // as well as after any setData() calls
            if ( $rtefirsttime === 1 )
                return;
            var dwcode = evt.data.dataValue;
            evt.data.dataValue = DWCodeToHtml( dwcode );
        }

        editor.on( 'setData', onSetData );

        editor.on( 'mode', function( event ) {
            if ( event.editor.mode === "source" ) {
                if ( $rtefirsttime ) {
                    $rtefirsttime = 0;
                    return;
                }
            }
        } );

        // Called whenever the editor dumps to source output
        // Priority 1 because we want the raw HTML prior to pseudo-DOM parsing
        editor.on( 'toDataFormat', function( evt ) {
            code = evt.data.dataValue;
            if ( !$("#preformatted").is(':checked') ) {
                code = code.replace(/\n/g, '');
                code = code.replace(/\<br ?\/\>/g, '\n');
                code = code.replace(/&nbsp;/g, ' ');
            }
            // Only way to get contenteditable=false nodes into the htmlFilter
            evt.data.dataValue = code.replace(/ ?contenteditable="(true|false)"/g, "");
        }, null, null, 1 );

        editor.addContentsCss( this.path + 'styles/dwpoll.css' );
    },

    afterInit: function( editor ) {
        // Used to populate the status bar at the bottom of the editor
        var filters;
        if ( editor._.elementsPath ) {
            if ( ( filters = editor._.elementsPath.filters ) ) {
                filters.push( function( element ) {
                    var htmlName = element.getName(),
                        name = false;
                    if ( htmlName == 'div' && element.hasClass( 'cuttag-open' ) ) {
                        name = 'cut';
                    } else if ( htmlName == 'div' && element.hasClass( 'ljembed' ) ) {
                        name = 'site-embed';
                    } else if ( htmlName == 'div' && element.hasClass( 'ljpoll' ) ) {
                        name = 'poll';
                    } else if ( htmlName == 'span' && element.hasClass( 'ljuser' ) ) {
                        name = 'user';
                    } else if ( htmlName == 'div' && element.hasClass( 'raw-code' ) ) {
                        name = 'raw';
                    }
                    return name;
                } );
            }
        }
    }
});
