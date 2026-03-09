import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const parseJsonBody = async (req) => {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8') || '{}'
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

const realtimeTokenPlugin = (env) => ({
  name: 'realtime-token-endpoint',
  configureServer(server) {
    server.middlewares.use('/api/realtime/client-secret', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      const apiKey = env.OPENAI_API_KEY
      if (!apiKey) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not configured on the server.' }))
        return
      }

      const body = await parseJsonBody(req)
      const collectionSummary = body?.collectionSummary || 'No collection provided.'
      const profileSummary = body?.profileSummary || 'No profile details provided.'

      const sessionPayload = {
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
          instructions: [
            'You are Drape Stylist, a voice stylist assistant.',
            'Focus strictly on the user collection items provided in context.',
            'Give concise, practical outfit advice using only those collection items.',
            'Never suggest items that are not explicitly in the collection context.',
            'If requested items are unavailable, say they are not in the collection and suggest closest options from the collection only.',
            'If details are missing, ask one short follow-up question.',
            'Do not suggest or discuss video, animation, clips, or motion unless the user explicitly asks for it.',
            `Profile: ${profileSummary}`,
            `Collection: ${collectionSummary}`
          ].join('\n'),
          audio: {
            input: {
              transcription: {
                model: 'gpt-4o-mini-transcribe'
              },
              turn_detection: {
                type: 'server_vad',
                create_response: true
              }
            },
            output: {
              voice: 'marin'
            }
          }
        }
      }

      try {
        const tokenResponse = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sessionPayload)
        })

        const text = await tokenResponse.text()
        res.statusCode = tokenResponse.status
        res.setHeader('Content-Type', 'application/json')
        res.end(text)
      } catch (error) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Failed to create realtime client secret.' }))
      }
    })
  }
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), realtimeTokenPlugin(env)],
  }
})
