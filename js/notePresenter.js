var notePresenter = (function () {

    var init = function () {
        var notes = [];
        noteModel.init();
        notes = noteModel.getNotes();
        lenght = notes.length;
        while (lenght--) {
            printNote(notes.shift());
        }
    },

        printNote = function (note) {
            noteView.addNote(note);
        }

    init();

    return {
        execute: function (name) {
            return notePresenter[name] && notePresenter[name].apply(notePresenter, [].slice.call(arguments, 1));
        },
        debug: function () {
            console.log(noteModel.debug());
        },
        create: function (action, note) {

            if (note == undefined) {
                var id = noteModel.genID();
                // creating a new note
                note = new Note(id, "Click Tittle", "Click Message", new Date(), id);
            }

            noteModel.create(action, note);
            printNote(note);
        },
        orderingByDom: function (notes, data) {
            notes.sort(function (note1, note2) {
                return note1.style.order - note2.style.order;
            });
            var noteTargetIndex = notes.findIndex(function (note) {
                return note.guid == data.guid;
            }),
                noteReferenceIndex = notes.findIndex(function (note) {
                    return note.guid == data.noteReferenceGuid;
                }),
                notesChanged = [], // array of data info
                data = {};

            notes[noteTargetIndex].style.order = notes[noteReferenceIndex].style.order;
            data = { id: notes[noteTargetIndex].guid, order: notes[noteTargetIndex].style.order };
            notesChanged.push(data);
            if (noteReferenceIndex < noteTargetIndex) {
                for (var index = noteReferenceIndex; index < noteTargetIndex; index++) {
                    notes[index].style.order++;
                    data = { id: notes[index].guid, order: notes[index].style.order };
                    notesChanged.push(data);
                    if (notes[index].style.order != notes[index + 1].style.order) {
                        break;
                    }
                }
            }
            else {
                for (var index = noteReferenceIndex; index > noteTargetIndex; index--) {
                    notes[index].style.order--;
                    data = { id: notes[index].guid, order: notes[index].style.order };
                    notesChanged.push(data);
                    if (notes[index].style.order != notes[index - 1].style.order) {
                        break;
                    }
                }
            }
            noteModel.ordering("ordering", notesChanged);
        },
        ordering: function (action, notes) {
            noteModel.ordering(action, notes);
            noteView.edit.apply(undefined,notes);
        },
        edit: function (action, data) {
            var hadChange = noteModel.edit(action, data);
            if (action == "edit") {
                return hadChange;
            }
            noteView.edit(data);
        },
        delete: function (action, id, note) {
            noteModel.delete(action, id);
            noteView.removeNote(id, note);
        },
        redo: function () {
            var change = {}
            change = noteModel.redo();
            if (!!change) {
                notePresenter.execute(change.action, "redo", change.changes);
            }
        },
        undo: function () {
            var change = {}
            change = noteModel.undo();
            if (!!change) {
                notePresenter.execute(change.action, "undo", change.changes);
            }
        }
    }
})();
