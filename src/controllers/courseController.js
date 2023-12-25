import Course from '../models/course.js'
import express from 'express'
import Log from '../models/log.js'
import authenticateToken from '../services/authenticateToken.js'

const router = express.Router()

router.get('/getAllCoursesEmployee/:employeeId', authenticateToken, async (req, res) => {
    const { employeeId } = req.params
    const courses = await Course.findAll({
        where: {
            employeeId: employeeId
        }
    })
    courses.length > 0 ? res.status(200).send(courses) : res.status(404).send(false)
})

router.get('/getAll', authenticateToken, async (req, res) => {
    const courses = await Course.findAll()
    courses.length > 0 ? res.status(200).send(courses) : res.status(404).send({ message: 'No course found' })
})

router.get('/getCourses/:id', async (req, res) => {
    const { id } = req.params
    const courses = await Course.findAll({
        where: {
            studentId: id
        }
    })
    courses.length > 0 ? res.status(200).send(courses) : res.status(404).send(false)
})

router.get('/getOne/:id', async (req, res) => {
    const { id } = req.params
    const course = await Course.findByPk(id)
    course ? res.status(200).send(course) : res.status(404).send({ message: 'Course not found' })
})

router.post('/insertOne', authenticateToken, async (req, res) => {
    const data = req.body
    const course = await Course.create(data)
    if (course) {
        await Log.create({ type: 'Cadastro Curso', description: `Realizado cadastro do curso ${course.category} - ${course.course} - ${course.classLoad} horas`, employeeId: data.employeeId })
        res.status(201).send(course)
    } else {
        res.status(400).send({ message: 'Course not created' })
    }
})

router.patch('/patchOne/:id', authenticateToken, async (req, res) => {
    const data = req.body
    const { id } = req.params
    const course = await Course.findByPk(id)
    course.set(data)
    const updated = await course.save()
    updated ? await Log.create({ type: 'Atualizar Curso', description: `Atualizado o curso para ${course.category} - ${course.course} - ${course.classLoad} horas`, employeeId: data.employeeId }) : null
    res.send(course)
})

router.delete('/deleteOne/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    const data = req.body
    const course = await Course.findByPk(id)
    const deleted = await course.destroy()
    deleted ? await Log.create({ type: 'Deletar Curso', description: `Deletado o curso ${course.category} - ${course.course} - ${course.classLoad} horas`, employeeId: data.employeeId }) : null
    res.send(course)
})

export default router