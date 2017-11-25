var noteModel = (function () {
    var noteHistory = new History(),
        notes = { last: 0 }

    addChange = function (action, change) {
        noteHistory.addChange(action, change);
    },


        save = function (note) {
            if (note != undefined) {
                // save note
                notes[note.id] = note;
            }
            // registing the note
            localStorage.setItem("notes", JSON.stringify(notes));
        }

    return {
        init: function () {
            if (!localStorage.getItem("notes")) {
                localStorage.setItem("notes", '{"notes":{}}');
            }
            notes = JSON.parse(localStorage.getItem("notes"));
        },
        debug: function () {
            console.log(notes);
            console.log(noteHistory);
        },
        getNotes: function () {
            var args = Array.from(arguments),
                length = args.length
            var send = [];
            if (length > 0) {
                for (var index = 0; index < length; index++) {
                    send.push(notes[args[index]]);
                }
            }
            else {
                for (var key in notes) {
                    if (notes.hasOwnProperty(key) && key != "last") {
                        send.push(notes[key]);
                    }
                }
            }
            return send;
        },
        genID: function () {
            return ++notes['last'];
        },
        create: function (action, note) {
            addChange(action, new Change("delete", note.id));
            save(note);
        },
        ordering: function (action, noteschanged) {
            var beforeOrder = [];
            noteschanged.forEach(function (data) {
                var note = Object.assign({}, notes[data.id]);
                beforeOrder.push({ id: note.id, order: note.order })
                note.order = data.order;
                save(note);
            });

            addChange(action, new Change("ordering", beforeOrder));
        },
        edit: function (action, data) {
            // finding the note
            var note = Object.assign({}, notes[data.id]),
                hadChange = false;

            // Comparing if the data change and replacing the note
            for (var key in data) {
                if (data.hasOwnProperty(key) && key != "editionDate" && note[key] != data[key]) {
                    note[key] = data[key];
                    hadChange = true;
                }
            }

            if (hadChange) {
                note["editionDate"] = data["editionDate"] ? data["editionDate"] : note["editionDate"];

                addChange(action, new Change("edit", Object.assign({}, notes[data.id])));
                // saving the note
                save(note);
            }

            // returning the note to display
            return hadChange;
        },
        delete: function (action, id) {
            var note = Object.assign({}, notes[id]);
            delete notes[id];
            isEmpty = true;
            for (var key in notes) {
                if (key !== "last" && notes[key]) {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty) {
                notes["last"] = 0;
            }
            save();
            addChange(action, new Change("create", Object.assign({}, note)));
        },
        redo: function () { 
            return noteHistory.redo();
        },
        undo: function () {
            return noteHistory.undo();
        }
    }
})();