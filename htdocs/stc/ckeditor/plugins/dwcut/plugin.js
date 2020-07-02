CKEDITOR.plugins.add( 'dwcut', {
    icons: 'dwcut',

    init: function( editor ) {
        editor.addCommand( 'dwcut', new CKEDITOR.dialogCommand( 'dwcutDialog', {
            allowedContent: 'cut[text]',
            requiredContent: 'cut',
            contentForms: [
                'cut'
            ]
        } ) );
        editor.ui.addButton( 'DWCut', {
            label: 'Insert Dreamwidth Cut',
            command: 'dwcut',
            toolbar: 'insert'
        } );
        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'dwGroup' );
            editor.addMenuItem( 'dwcutItem', {
                label: 'Edit Cut',
                icon: this.path + 'icons/dwcut.png',
                command: 'dwcut',
                group: 'dwGroup'
            } );

            editor.contextMenu.addListener( function( element ) {
                var parent = element.getAscendant( 'div', true );
                if ( parent.hasClass( 'cuttag-open' ) ) {
                    return { cutItem: CKEDITOR.TRISTATE_OFF };
                }
            } );
        }

        CKEDITOR.dialog.add( 'dwcutDialog', this.path + 'dialogs/dwcut.js' );
        editor.addContentsCss( this.path + 'styles/dwcut.css' );
    }
});
