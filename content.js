alert('root');
document.addEventListener('mouseup', function (event) {
    const selection = CorePuzzleEnglishDictionaryModule.getSelected().toString();
    if (selection) {
        alert(selection);
    }
});
