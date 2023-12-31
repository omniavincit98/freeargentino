import bcrypt from 'bcryptjs'
import Employee from '../models/employee.js'
import Log from '../models/log.js'
import generateToken from '../services/generateToken.js'
import validateToken from '../services/validateToken.js'
import authenticateToken from '../services/authenticateToken.js'
import express from 'express'
import jsonwebtoken from 'jsonwebtoken'

const jwt = jsonwebtoken
const router = express.Router()

router.post('/login', async (req, res) => {
    let { username, password } = req.body
    const employee = await Employee.findOne({
        where: {
            username: username
        }
    })
    if (employee) {
        const passwordMatched = await bcrypt.compare(password, employee.password)
        if (passwordMatched) {
            const token = generateToken({ id: employee.id, username: employee.username, role: employee.role }, 'secret')
            res.send({ token: token, employee: employee })
        } else {
            res.send(false)
        }
    } else {
        res.send({ message: "Usuário ou senha inválida" })
    }

})

router.post('/register', async (req, res) => {
    let { username, password, name } = req.body
    const employees = await Employee.findAll({
        where: {
            username: username
        }
    })
    if (employees.length < 1) {
        password = await bcrypt.hash(password, 8)
        const employee = await Employee.create({ username, password, name })
        employee ? await Log.create({ type: 'Cadastro Parceiro', description: `Realizado cadastro de ${employee.name}`, employeeId: employee.id }) : null
        const token = generateToken({ id: employee.id, username: employee.username, role: employee.role }, 'secret')
        res.send({ token: token, employee: employee })
    } else {
        res.send({ message: "Usuário já existente" })
    }
})

router.get('/authenticateToken/:token', (req, res) => {
    const { token } = req.params
    token.includes('Bearer') ? token = token.split(' ').pop() : null

    if (token == null) { return res.status(401).send(false) }

    const authenticated = jwt.verify(token, 'secret', (err, user) => {
        if (err) return res.status(403).send(false)
        return true
    })
    res.send(authenticated)
})

router.get('/authenticate/:token/:idEmployee', (req, res) => {
    const { token, idEmployee } = req.params
    const validatedToken = validateToken(token, 'secret', idEmployee)
    res.send(validatedToken)
})

router.post('/generateToken', (req, res) => {
    const data = req.body
    const token = generateToken({ id: employee.id, username: employee.username, role: employee.role }, 'secret')
})

router.get('/checkRole/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    const employee = await Employee.findByPk(id)
    employee ? res.status(200).send(employee.role) : res.status(404).send('Employee not found')
})

export default router