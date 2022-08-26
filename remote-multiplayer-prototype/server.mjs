import express from'express'
import{MongoClient}from'mongodb'

const e=express()

e.get('/',(r,s)=>s.send('hello'))