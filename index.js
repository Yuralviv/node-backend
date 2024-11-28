require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Note = require('./models/note')

const app = express();
app.use(cors());
app.use(express.json());

const url = process.env.MONGODB_URI;

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}


app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes);
    });
});

app.get('/api/notes/:id', (req, res) => {
    const id = req.params.id;

    Note.findById(id)
        .then(note => {
            if (note) {
                res.json(note);
            } else {
                res.status(404).end();
            }
        })
        .catch(error => {
            res.status(500).json({error: 'malformatted id'});
        });
});

app.post('/api/notes', (req, res, next) => {
    const body = req.body;

    if (!body.content) {
        return res.status(400).json({error: 'content missing'});
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
        .then(savedNote => {
            response.json(savedNote)
        })
        .catch(error => next(error))
});

app.delete('/api/notes/:id', (req, res) => {
    const id = req.params.id;

    Note.findByIdAndRemove(id)
        .then(result => {
            res.status(204).end();
        })
        .catch(error => {
            res.status(400).json({error: 'malformatted id'});
        });
});

app.put('/api/notes/:id', (request, response, next) => {

    const { content, important } = request.body

    Note.findByIdAndUpdate(
        request.params.id,

        { content, important },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedNote => {
            response.json(updatedNote)
        })
        .catch(error => next(error))
})

const PORT = process.env.PORT || 3001;


app.use(errorHandler)
app.use(requestLogger)
app.use(unknownEndpoint)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
