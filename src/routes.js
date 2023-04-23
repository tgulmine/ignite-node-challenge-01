import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                id: search,
                title: search
            } : null)

            if (!tasks) {
                return res.writeHead(401).end("Sem tasks.")
            }

            return res.writeHead(200).end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body

            if (!title || !description) {
                return res.writeHead(401).end("Necessário conter campos title e description.")
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date(),
            }

            database.insert('tasks', task)

            return res.writeHead(201).end(`Task criada com id ${task.id}`)
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            if (!database.validateId('tasks', id)) {
                return res.writeHead(401).end(`Id ${id} não encontrado.`)
            }

            if (!title || !description) {
                return res.writeHead(401).end("Necessário conter campos title e description.")
            }

            database.update('tasks', id, {
                title,
                description,
                updated_at: new Date(),
            })

            return res.writeHead(204).end(`Task com id ${id} foi alterada.`)
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            if (!database.validateId('tasks', id)) {
                return res.writeHead(401).end(`Id ${id} não encontrado.`)
            }

            database.delete('tasks', id)

            return res.writeHead(204).end(`Task com id ${id} foi deletada.`)
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            if (!database.validateId('tasks', id)) {
                return res.writeHead(401).end(`Id ${id} não encontrado.`)
            }

            database.update('tasks', id, {
                completed_at: new Date(),
                updated_at: new Date(),
            })

            return res.writeHead(204).end(`Task com id ${id} foi marcada como completa.`)
        }
    }
]