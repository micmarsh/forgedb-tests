
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
    asyncTest("create the tables", function() {
        $db.createTables().then(function (done) {
            equal(done, done);
            start();
        })
    })
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



    // asyncTest('can create multiple notes at once', function() {
    //       var i, noteCount, notes, _i;
    //       noteCount = 5;
    //       notes = [];
    //       for (i = _i = 0; 0 <= noteCount ? _i < noteCount : _i > noteCount; i = 0 <= noteCount ? ++_i : --_i) {
    //         notes.push(getDummyNote());
    //       }
    //       $db.create(notes).then(function () {
    //             return $db.getNotes();
    //       },  function (error) {
    //             alert(error);
    //         }).then(function(notesFromDb) {
    //             equal(notesFromDb.length, noteCount);
    //             start();
    //         });
      
    //     });

//     asyncTest('can create a dirty note marked with status:create', function() {
//       $db.create(getDummyNote(), {
//         dirty: true
//       });
//       return $db.getNotes().then(function(notes) {
//         expect(notes.length).toEqual(1);
//         return expect(notes[0].status).toBe('create');
//       });
//     });

//     asyncTest('can update a note', function() {
//       var id, newText, oldText, originalNote;
//       originalNote = getDummyNote();
//       id = originalNote._id;
//       oldText = originalNote.text;
//       $db.create(originalNote);
//       newText = 'no longer poop';
//       $db.update({
//         _id: id,
//         text: newText
//       });
//       return $db.getNotes().then(function(notes) {
//         expect(notes.length).toEqual(1);
//         expect(notes[0].text).not.toEqual(oldText);
//         return expect(notes[0].text).toEqual(newText);
//       });
//     });

//     asyncTest('can update a dirty note', function() {
//       var id, newText, oldText, originalNote;
//       originalNote = getDummyNote();
//       id = originalNote._id;
//       oldText = originalNote.text;
//       $db.create(originalNote);
//       newText = 'ohhhh so dirty';
//       $db.update({
//         _id: id,
//         text: newText
//       }, {
//         dirty: true
//       });
//       return $db.getNotes().then(function(notes) {
//         expect(notes.length).toEqual(1);
//         expect(notes[0].text).not.toEqual(oldText);
//         expect(notes[0].text).toEqual(newText);
//         return expect(notes[0].status).toEqual('update');
//       });
//     });

//     asyncTest('can delete a note', function() {
//       var id, note;
//       note = getDummyNote();
//       id = note._id;
//       $db.create(note);
//       $db["delete"]({
//         _id: id
//       });
//       return $db.getNotes().then(function(notes) {
//         return expect(notes.length).toEqual(0);
//       });
//     });

//     /*
//         FIGURE OUT TESTS FOR .SYNC()
//     */


//     asyncTest('can get tags', function() {
//       var expectedTags, note1, note2;
//       note1 = getDummyNote('what #up #dude');
//       note2 = getDummyNote('omg #up #yours');
//       expectedTags = ['#up', '#dude', '#yours'];
//       $db.create([note1, note2]);
//       return $db.getTags().then(function(tags) {
//         var tag, _i, _len, _results;
//         _results = [];
//         for (_i = 0, _len = tags.length; _i < _len; _i++) {
//           tag = tags[_i];
//           _results.push(expect(expectedTags.indexOf(tag.name)).not.toEqual(-1));
//         }
//         return _results;
//       });
//     });

//     asyncTest('can get contacts', function() {
//       var expectedContacts, note1, note2;
//       note1 = getDummyNote('what up @matt');
//       note2 = getDummyNote('@alex omg dude - via @alexh');
//       expectedContacts = ['@matt', '@alex', '@alexh'];
//       $db.create([note1, note2]);
//       return $db.getContacts().then(function(contacts) {
//         var contact, _i, _len, _results;
//         _results = [];
//         for (_i = 0, _len = contacts.length; _i < _len; _i++) {
//           contact = contacts[_i];
//           _results.push(expect(expectedContacts.indexOf(contact.name)).not.toEqual(-1));
//         }
//         return _results;
//       });
// });

});