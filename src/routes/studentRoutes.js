import express from 'express'
import authenticateToken from '../services/authenticateToken.js'
import { studentDeleteOne, studentGetAll, studentGetCpf, studentGetId, studentGetOne, studentInsertOne, studentPatchOne } from '../controllers/studentController.js'

const router = express.Router()

router.get('/getAll', authenticateToken, studentGetAll)
router.get('/getOne/:id', authenticateToken, studentGetOne)
router.get('/getId/:id', studentGetId)
router.get('/getCpf/:cpf', studentGetCpf)
router.post('/insertOne', authenticateToken, studentInsertOne)
router.patch('/patchOne/:id', authenticateToken, studentPatchOne)
router.delete('/deleteOne/:id', authenticateToken, studentDeleteOne)

export default router