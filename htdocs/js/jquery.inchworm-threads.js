jQuery(function($){
    "use strict";
    $(document).on('click', '.threadfocus-hide-trigger', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var focusControl = $(e.target).closest('.threadfocus');
        var focusTarget = $('#' + focusControl.data('target'));
        var thread = focusControl.closest('.comment-thread');
        var toHide = thread.prevUntil(focusTarget);
        toHide.hide({
            duration: 0,
        }).promise().done(function() {
            var scrollDest = thread.offset().top - 150;
            window.scrollTo(window.scrollX, scrollDest);
            focusControl.find('.threadfocus-siblings-hidden').show();
            $(e.target).closest('.threadfocus-siblings-visible').hide();
        });
    });

    $(document).on('click', '.threadfocus-show-trigger', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var focusControl = $(e.target).closest('.threadfocus');
        var focusTarget = $('#' + focusControl.data('target'));
        var thread = focusControl.closest('.comment-thread');
        var toShow = thread.prevUntil(focusTarget);
        toShow.show({
            duration: 0,
        }).promise().done(function() {
            var scrollDest = thread.offset().top - 150;
            window.scrollTo(window.scrollX, scrollDest);
            focusControl.find('.threadfocus-siblings-visible').show();
            $(e.target).closest('.threadfocus-siblings-hidden').hide();
        });
    });
});
