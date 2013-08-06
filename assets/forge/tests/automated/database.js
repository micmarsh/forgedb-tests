
var injector = angular.injector(['ng', '$app.services']);

function findTags (str) {
  return (str.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, '').match(/#[\w]+/g) || []).map(function (tag) {
    return tag.toLowerCase();
  });
};

function findContacts (str) {
  return (str.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/ig, '').replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig).match(/@[\w]+/g) || []).map(function (contact) {
    return contact.toLowerCase();
  });
};

function findEmails (str) {
  return str.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})/ig) || [];
};

function findUrls (str) {
  return str.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig) || [];
};

function findEntities (text) {
  return {
    hashtags: findTags(text),
    attags: findContacts(text),
    emails:findEmails(text),
    urls: findUrls(text)
  };
};


function generateFakeID () {
  return Math.floor(Math.random() * 1000000000);
};

function getDummyNote (text) {
  text || (text = 'poop');
  return {
    text: text,
    _id: generateFakeID(),
    timestamp: new Date().toISOString(),
    entities: findEntities(text)
  };
};

injector.invoke( function ($db) {
    var oldAsyncTest = asyncTest;
    asyncTest = function(string, test){
        oldAsyncTest(string, function () {
            $db.clear().then(function () {
                return $db.createTables();
            }, function (error) {
                return $db.createTables();
            }).then(function () {
                test();
            });
        });
    };

    asyncTest("gets no notes when it's empty", function(){
        $db.getNotes().then(function(notes){
            equal(notes.length, 0);
            start();
        });
    })
    asyncTest("can create a note", function(){
        var note = getDummyNote();
        $db.create(note).then(function(){
            return $db.getNotes();
        }).then(function (notes) {
            equal(notes.length, 1);
            start();
        });
    });

    asyncTest('can create multiple notes at once', function() {
          var i, noteCount, notes, _i;
          noteCount = 5;
          notes = [];
          for (i = _i = 0; 0 <= noteCount ? _i < noteCount : _i > noteCount; i = 0 <= noteCount ? ++_i : --_i) {
            notes.push(getDummyNote());
          }
          $db.create(notes).then(function () {
                return $db.getNotes();
          }).then(function (notesFromDb) {
                equal(notesFromDb.length, noteCount);
                start();
            });
      
        });

    asyncTest('can create a dirty note marked with status:create', function() {
      $db.create(getDummyNote(), {
        dirty: true
      }).then(function () {
        return $db.getNotes();
      }).then(function(notes) {
        equal(notes.length, 1);
        equal(notes[0].status, 'create');
        start();
      });
    });

    asyncTest('can update a note', function() {
      var id, newText, oldText, originalNote;
      originalNote = getDummyNote();
      id = originalNote._id;
      oldText = originalNote.text;
      $db.create(originalNote).then(function (ids) {
            newText = 'no longer poop';
            return $db.update({
                localID: originalNote.localID,
                text: newText
              });
      }).then(function () {
            return $db.getNotes();
      }).then(function(notes) {
            var note = notes[0];
            equal(notes.length, 1);
            notEqual(note.text, oldText);
            equal(note.text, newText);
            equal(note._id, originalNote._id);
            equal(note.timestamp, originalNote.timestamp);
            start();
      });
    });

    asyncTest('can update a dirty note', function() {
      var id, newText, oldText, originalNote;
      originalNote = getDummyNote();
      id = originalNote._id;
      oldText = originalNote.text;
      $db.create(originalNote).then(function () {
          newText = 'ohhhh so dirty';
          return $db.update({
            localID: originalNote.localID,
            text: newText
          }, {
            dirty: true
          });
      }).then(function () {
        return $db.getNotes();
      }).then(function (notes) {
        equal(notes.length, 1);
        notEqual(notes[0].text, oldText);
        equal(notes[0].text, newText);
        equal(notes[0].status, 'update');
        start();
      });
    });

    asyncTest('can delete a note', function() {
      var id, note;
      note = getDummyNote();
      id = note._id;
      $db.create(note).then(function () {
          return $db["delete"]({
            localID: note.localID
          });   
      }).then(function () {
         return $db.getNotes();
      }).then(function(notes) {
         equal(notes.length, 0);
         start();
      });
    });

//     /*
//         FIGURE OUT TESTS FOR .SYNC()
//     */


    asyncTest('can get tags', function() {
      var expectedTags, note1, note2;
      note1 = getDummyNote('what #up #dude');
      note2 = getDummyNote('omg #up #yours');
      expectedTags = ['#up', '#dude', '#yours'];
      $db.create([note1, note2]).then(function () {
        return $db.getTags();
      }).then(function (tags) {
        var tag, _i, _len, _results;
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          tag = tags[_i];
          notEqual(expectedTags.indexOf(tag.name), -1);
        }
        start();
      });
    });

    asyncTest('can get contacts', function() {
      var expectedContacts, note1, note2;
      note1 = getDummyNote('what up @matt');
      note2 = getDummyNote('@alex omg dude - via @alexh');
      expectedContacts = ['@matt', '@alex', '@alexh'];
      $db.create([note1, note2]).then(function () {
        return $db.getContacts();
      }).then(function (contacts) {
        var contact, _i, _len, _results;
        for (_i = 0, _len = contacts.length; _i < _len; _i++) {
          contact = contacts[_i];
          notEqual(expectedContacts.indexOf(contact.name), -1);
        }
        start();
      });
});

});