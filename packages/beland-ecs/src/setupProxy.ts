import * as path from 'path'
import * as fs from 'fs'
import * as express from 'express'
import { createStaticRoutes } from './cli/setupUtils'
import { mockCatalyst } from './cli/mock-catalyst'
import { mockPreviewWearables } from './cli/wearables'
import { sdk } from '@beland/schemas'

const setupProxy = (bld: any, app: express.Application) => {
  // first resolve all dependencies in the local current working directory
  // second try to resolve dependencies in beland-ecs folder
  /**
   * to test locally with linked packages:
   *
   * 1. go to explorer/kernel/static and run `npm link`
   * 2. in an empty folder create a test scene with `bld init`
   * 3. in that folder run `npm install folder-to/beland-ecs`
   * 4. install whatever version of `@beland/unity-renderer` you want to test
   * 5. link kernel using `npm link @beland/kernel` this will use the folder from step 1
   */

  const ecsPath = path.dirname(
    require.resolve('beland-ecs/package.json', {
      paths: [bld.getWorkingDir(), __dirname + '/../../', __dirname + '/../']
    })
  )
  const bldKernelPath = path.dirname(
    require.resolve('@beland/kernel/package.json', {
      paths: [bld.getWorkingDir(), ecsPath]
    })
  )
  const bldKernelDefaultProfilePath = path.resolve(
    bldKernelPath,
    'default-profile'
  )
  const bldKernelImagesBelandConnect = path.resolve(
    bldKernelPath,
    'images',
    'beland-connect'
  )
  const bldKernelLoaderPath = path.resolve(bldKernelPath, 'loader')
  const bldUnityRenderer = path.dirname(
    require.resolve('@beland/unity-renderer/package.json', {
      paths: [bld.getWorkingDir(), ecsPath]
    })
  )

  let baseSceneFolders: string[] = [bld.getWorkingDir()]
  let baseWearableFolders: string[] = [bld.getWorkingDir()]

  // TODO: merge types from github.com/belandproject/cli
  if (bld.workspace) {
    const projects = bld.workspace.getAllProjects()
    if (!!projects?.length) {
      const { wearables, scenes } = projects.reduce(
        (acc: { wearables: string[]; scenes: string[] }, project: any) => {
          const projectType = project.getInfo().sceneType
          const projectDir = project.getProjectWorkingDir()
          if (projectType === sdk.ProjectType.SCENE) acc.scenes.push(projectDir)
          if (projectType === sdk.ProjectType.PORTABLE_EXPERIENCE)
            acc.wearables.push(projectDir)
          return acc
        },
        { wearables: [], scenes: [] }
      )

      baseSceneFolders = scenes
      baseWearableFolders = wearables
    }
  }

  try {
    mockCatalyst(app, [...baseSceneFolders, ...baseWearableFolders])
  } catch (err) {
    console.error(`Fatal error, couldn't mock the catalyst`, err)
  }

  try {
    mockPreviewWearables(app, baseWearableFolders)
  } catch (err) {
    console.error(`Fatal error, couldn't mock the wearables`, err)
  }

  const routes = [
    {
      route: '/',
      path: path.resolve(bldKernelPath, 'preview.html'),
      type: 'text/html'
    },
    {
      route: '/favicon.ico',
      path: path.resolve(bldKernelPath, 'favicon.ico'),
      type: 'text/html'
    },
    {
      route: '/@/artifacts/index.js',
      path: path.resolve(bldKernelPath, 'index.js'),
      type: 'text/javascript'
    }
  ]

  for (const route of routes) {
    app.get(route.route, async (req, res) => {
      res.setHeader('Content-Type', route.type)
      const contentFile = fs.readFileSync(route.path)
      res.send(contentFile)
    })
  }

  createStaticRoutes(
    app,
    '/images/beland-connect/*',
    bldKernelImagesBelandConnect
  )
  createStaticRoutes(
    app,
    '/@/artifacts/unity-renderer/*',
    bldUnityRenderer,
    (filePath) => filePath.replace(/.br+$/, '')
  )
  createStaticRoutes(app, '/@/artifacts/loader/*', bldKernelLoaderPath)
  createStaticRoutes(app, '/default-profile/*', bldKernelDefaultProfilePath)

  app.get('/feature-flags/:file', async (req, res) => {
    return res.json({})
  })
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export = setupProxy
