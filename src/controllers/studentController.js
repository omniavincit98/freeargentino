import { v4 as uuidv4 } from 'uuid'
import Student from '../models/student.js'
import Employee from '../models/employee.js'
import Log from '../models/log.js'
import generateToken from '../services/generateToken.js'
import express from 'express'
import authenticateToken from '../services/authenticateToken.js'

const router = express.Router()

router.get('/getAllStudentsEmployee/:employeeId', authenticateToken, async (req, res) => {
    const { employeeId } = req.params
    const employee = await Employee.findByPk(employeeId)
    if (employee.admin == true) {
        const students = await Student.findAll()
        students.length > 0 ? res.status(200).send(students) : res.status(404).send(false)
    } else {
        const students = await Student.findAll({
            where: {
                employeeId: employeeId
            }
        })
        students.length > 0 ? res.status(200).send(students) : res.status(404).send(false)
    }
})

router.get('/getAll', authenticateToken, async (req, res) => {
    const students = await Student.findAll()
    students.length > 0 ? res.status(200).send(students) : res.status(404).send(false)
})

router.get('/getOne/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    const student = await Student.findByPk(id)
    student ? res.status(200).send(student) : res.status(404).send(false)
})

router.get('/getId/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    const student = await Student.findOne({
        where: {
            id: id
        }
    })
    student ? res.status(200).send(student) : res.status(404).send(false)
})

router.get('/getPublicId/:id', async (req, res) => {
    const { id } = req.params
    const student = await Student.findOne({
        where: {
            id: id
        }
    })
    student ? res.status(200).send(student) : res.status(404).send(false)
})

router.get('/getCpf/:cpf', async (req, res) => {
    const { cpf } = req.params
    const student = await Student.findOne({
        where: {
            cpf: cpf
        }
    })
    student ? res.send({ success: true, student: student }) : res.send({ success: false })
})

router.post('/insertOne', authenticateToken, async (req, res) => {
    let data = req.body
    data.maxRegisterAmount = 0
    data.id = uuidv4()
    const employee = await Employee.findByPk(data.employeeId)
    if (employee.registeredAmount < employee.maxRegisterAmount) {
        const student = await Student.create(data)
        await Employee.increment('registeredAmount', { by: 1, where: { id: data.employeeId } })
        student ? await Log.create({ type: 'Cadastrar Aluno', description: `Realizado o cadastro do aluno ${student.firstName} ${student.lastName}`, employeeId: data.employeeId }) : null
        student ? res.status(201).send({ success: true, student: student }) : res.status(400).send({ success: false })
    } else {
        res.status(401).send({ success: false })
    }
})

router.patch('/patchOne/:id', authenticateToken, async (req, res) => {
    const data = req.body
    const { id } = req.params
    const employee = await Employee.findByPk(data.employeeId)
    if (employee.registeredAmount < employee.maxRegisterAmount) {
        const student = await Student.findByPk(id)
        student.set(data)
        const updated = await student.save()
        updated ? await Log.create({ type: 'Atualizar Aluno', description: `Atualizado o aluno para ${student.firstName} ${student.lastName}`, employeeId: data.employeeId }) : null
        updated ? res.status(201).send({ success: true, student: student }) : res.status(400).send({ success: false })
    } else {
        res.status(401).send({ success: false })
    }
})

router.delete('/deleteOne/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    const data = req.body
    const employee = await Employee.findByPk(data.employeeId)
    if (employee.registeredAmount < employee.maxRegisterAmount) {
        const student = await Student.findByPk(id)
        const deleted = await student.destroy()
        deleted ? await Log.create({ type: 'Deletar Aluno', description: `Deletado o aluno ${student.firstName} ${student.lastName}`, employeeId: data.employeeId }) : null
        deleted ? res.status(201).send({ success: true, student: student }) : res.status(400).send({ success: false })
    } else {
        res.status(401).send({ success: false })
    }
})

export default router