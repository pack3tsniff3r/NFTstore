const app = express();

// Allow requests only from a specific origin (your frontend domain)
const corsOptions = {
  origin: 'https://nf-tstore-j4s2.vercel.app/', // Replace with your actual frontend domain
  methods: ['GET', 'POST'], // Allow only specific methods (optional)
};