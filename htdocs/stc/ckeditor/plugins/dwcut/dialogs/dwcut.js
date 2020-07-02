CKEDITOR.dialog.add( 'dwcutDialog', function( editor ) {
    return {
        title: "Cut Properties",
        minWidth: 400,
        minHeight: 200,
        contents: [
            {
                id: 'tab-basic',
                label: 'Basic Settings',
                elements: [
                    {
                        type: 'text',
                        id: 'dwcut',
                        label: 'Cut link text',
                        'default': 'Read more...',
                        validate: CKEDITOR.dialog.validate.notEmpty( "Cut text field cannot be empty." ),
                        setup: function( element ) {
                            this.setValue(
                                element.getChild(0).getChild(0).getText()
                            );
                        },
                        commit: function( element ) {
                            var text = this.getValue();
                            element.getChild(0).getChild(0).setText( this.getValue() );
                            //Cannot be blank
                            //else if ( !this.insertMode )
                            //    element.removeAttribute( 'text' );
                        }
                    }
                ]
            }
        ],

        onShow: function() {
            var selection = editor.getSelection();
            var element = selection.getStartElement();
            if ( element ) {
                // find top-level cuttag-open div
                posselement = element.getAscendant( 'div' );
                if ( posselement && ( posselement.hasClass( 'title' ) || posselement.hasClass( 'content' ) ) ) {
                    posselement = posselement.getAscendant( 'div' );
                }
                if ( posselement && posselement.hasClass( 'cuttag-open' ) ) {
                    element = posselement;
                }
            }
            if ( !element || !element.hasClass( 'cuttag-open' ) ) {
                // must be creating a new one
                this.insertMode = true;
                title = editor.document.createElement( 'div' );
                title.addClass( 'title' );
                title.setAttribute( 'contenteditable', "false" );
                titlespan = editor.document.createElement( 'span' );
                titlespan.setText( "Read more..." );
                titlespan.setAttribute( 'contenteditable', "false" );
                title.append(titlespan);
                
                content = editor.document.createElement( 'div' );
                content.addClass( 'content' );
                content.setAttribute( 'contenteditable', "true" );
                //contentp = editor.document.createElement( 'p' );
                if ( selection.getSelectedText() ) {
                    ranges = selection.getRanges();
                    for (var ctr=0; ctr < ranges.length; ctr++) {
                        content.append(ranges[ctr].cloneContents());
                    }
                } else {
                    content.setText( "Enter your cut contents here." );
                }
                //contentp.setAttribute( 'contenteditable', "true" );
                //content.append(contentp);

                element = editor.document.createElement( 'div' );
                element.addClass( 'cuttag-open' );
                element.append(title);
                element.append(content);
                element.setAttribute( 'contenteditable', "false" );
            } else {
                this.insertMode = false;
            }
            this.element = element;
            if ( !this.insertMode )
                this.setupContent( this.element );
        },

        onOk: function() {
            var dialog = this;
            var cut = this.element;
            this.commitContent( cut );
            if ( this.insertMode )
                editor.insertElement( cut );
        }
    };
});
