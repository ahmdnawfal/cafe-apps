import express from 'express';
import cors from 'cors';
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import routes from './routes/index.js';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();

// Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description:
        'A simple CRUD API application made with Express and documented with Swagger',
    },
  },
  apis: ['./controllers/*.js'],
};
const specs = swaggerJsdoc(options);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ msg: 'hello world' });
});
app.use('/api', routes);

// Handler Errors
app.use(errorHandlerMiddleware);

app.use('*', (req, res) => {
  return res.status(404).json({ msg: 'not found' });
});

app.use((err, req, res, next) => {
  console.log(err);
  return res.status(500).json({ msg: 'something went wrong' });
});

app.listen(PORT, () => {
  console.log('server running');
});
