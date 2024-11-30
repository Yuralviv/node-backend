const notesRouter = require('express').Router()

const Note = require('../models/note')
const User = require('../models/user')

const logger = require('../utils/logger')

notesRouter.get('/', async(request, response) => {
    const notes = await Note
        .find({}).populate('user', { username: 1, name: 1 })



    Note.find({}).then(notes => {
        response.json(notes)
    })
})

notesRouter.get('/:id', (request, response, next) => {
    Note.findById(request.params.id)
        .then(note => {
            if (note) {
                response.json(note)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

// notesRouter.post('/', async (request, response, next) => {
//     const body = request.body
//
//     const user = await User.findById(body.userId)
//
//     const note = new Note({
//         content: body.content,
//         important: body.important === undefined ? false : body.important,
//         user: user.id
//     })
//     //
//     // note.save()
//     //     .then(savedNote => {
//     //         response.json(savedNote)
//     //     })
//     //     .catch(error => next(error))
//     const savedNote = await note.save()
//     user.notes = user.notes.concat(savedNote._id)
//     await user.save()
//
//     response.status(201).json(savedNote)
// })
// notesRouter.post('/', async (request, response, next) => {
//     try {
//         const body = request.body;
//
//         // Знайти користувача
//         const user = await User.findById(body.userId);
//         if (!user) {
//             return response.status(400).json({ error: 'User not found' });
//         }
//
//         const note = new Note({
//             content: body.content,
//             important: body.important === undefined ? false : body.important,
//             user: user.id,
//         });
//
//         // Зберегти нотатку
//         const savedNote = await note.save();
//
//         // Оновити список нотаток користувача
//         user.notes = user.notes.concat(savedNote._id);
//         await user.save();
//
//         response.status(201).json(savedNote);
//     } catch (error) {
//         next(error);
//     }
// });

notesRouter.post('/', async (request, response) => {
    const body = request.body

    logger.info('body', body)

    const user = await User.findById(body.userId)

    const note = new Note({
        content: body.content,
        important: body.important === undefined ? false : body.important,
        user: user.id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.status(201).json(savedNote)
})




notesRouter.delete('/:id', (request, response, next) => {
    Note.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

notesRouter.put('/:id', (request, response, next) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

module.exports = notesRouter