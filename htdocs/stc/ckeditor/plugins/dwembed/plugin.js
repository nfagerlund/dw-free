CKEDITOR.plugins.add( 'dwembed', {
    icons: 'dwembed',

    init: function( editor ) {
        editor.addCommand( 'dwembed', new CKEDITOR.dialogCommand( 'dwembedDialog', {
            allowedContent: 'site-embed div',
        } ) );
        editor.ui.addButton( 'DWEmbed', {
            label: 'Insert Dreamwidth Embed',
            command: 'dwembed',
            toolbar: 'insert'
        } );
        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'dwGroup' );
            editor.addMenuItem( 'dwembedItem', {
                label: 'Edit Embed',
                icon: this.path + 'icons/dwembed.png',
                command: 'dwembed',
                group: 'dwGroup'
            } );

            editor.contextMenu.addListener( function( element ) {
                var parent = element.getAscendant( 'div', true );
                if ( parent.hasClass( 'ljembed' ) ) {
                    return { embedItem: CKEDITOR.TRISTATE_OFF };
                }
            } );
        }

        CKEDITOR.dialog.add( 'dwembedDialog', this.path + 'dialogs/dwembed.js' );
    }
});
