import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <ChakraProvider value={defaultSystem}>
    <App />
  </ChakraProvider>,
)
