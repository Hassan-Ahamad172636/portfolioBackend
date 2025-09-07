// app.js
import express from "express";
import cors from "cors";
import userRoutes from './routes/user.routes.js'
import blogRoutes from './routes/blog.routes.js'
import contactRoutes from './routes/contact.routes.js'
import expirenceRoutes from './routes/expirence.routes.js'
import projectRoutes from './routes/project.routes.js'
import qaRoutes from './routes/qa.routes.js'
import skillRoutes from './routes/skill.routes.js'
import testimonialRoutes from './routes/testimonial.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import path from "path";
const app = express();

// Body parser
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "public")));
app.use(cors())
// Example route

app.use('/user', userRoutes)
app.use('/blogs', blogRoutes)
app.use('/contact', contactRoutes)
app.use('/experiences', expirenceRoutes)
app.use('/project', projectRoutes)
app.use('/qa', qaRoutes)
app.use('/skill', skillRoutes)
app.use('/testimonials', testimonialRoutes)
app.use('/dashboard', dashboardRoutes)

export default app;
