import * as path from 'path'
import * as express from 'express'
import { getSceneJson } from '../setupUtils'

export const mockHub = (app: express.Application, baseFolders: string[]) => {
  serveFolders(app, baseFolders)
}

const serveFolders = (app: express.Application, baseFolders: string[]) => {
  app.get('/ipfs/:hash', (req, res, next) => {
    if (req.params.hash && req.params.hash.startsWith('b64-')) {
      const fullPath = path.resolve(
        Buffer.from(req.params.hash.replace(/^b64-/, ''), 'base64').toString(
          'utf8'
        )
      )

      // only return files IF the file is within a baseFolder
      if (!baseFolders.find((folder: string) => fullPath.startsWith(folder))) {
        next()
        return
      }

      const options = {
        dotfiles: 'deny',
        maxAge: 1,
        cacheControl: false,
        lastModified: true,
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true,
          etag: JSON.stringify(Date.now().toString()),
          'cache-control': 'no-cache,private,max-age=1'
        }
      }

      res.sendFile(fullPath, options, (err) => {
        if (err) {
          next(err)
        }
      })
    }
  })

  app.get('/v1/scenes', (req, res) => {
    if (!req.query.pointers) {
      res.json([])
      return
    }

    const requestedPointers = new Set<string>(
      req.query.pointers && typeof req.query.pointers === 'string'
        ? [req.query.pointers as string]
        : (req.query.pointers as string[])
    )

    const resultEntities = getSceneJson({
      baseFolders,
      pointers: Array.from(requestedPointers)
    })
    res.json({ rows: resultEntities, count: resultEntities.length }).end()
  })
}
