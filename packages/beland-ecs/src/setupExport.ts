import * as path from 'path'
import * as fs from 'fs'
import {
  entityFromFolder,
  copyDir,
  getSceneJson,
  ensureWriteFile,
  ensureCopyFile,
  shaHashMaker
} from './cli/setupUtils'

const setupExport = async ({
  workDir,
  exportDir,
  mappings
}: {
  workDir: string
  exportDir: string
  mappings: any
  sceneJson: any
}): Promise<void> => {
  try {
    // 1) Path resolving
    const ecsPath = path.dirname(
      require.resolve('beland-ecs/package.json', {
        paths: [workDir, __dirname + '/../../', __dirname + '/../']
      })
    )
    const bldIgnorePath = path.resolve(workDir, '.bldignore')
    const bldKernelPath = path.dirname(
      require.resolve('@beland/kernel/package.json', {
        paths: [workDir, ecsPath]
      })
    )
    const bldKernelDefaultProfilePath = path.resolve(
      bldKernelPath,
      'default-profile'
    )
    const bldKernelLoaderPath = path.resolve(bldKernelPath, 'loader')
    const bldKernelImagesBelandConnectPath = path.resolve(
      bldKernelPath,
      'images',
      'beland-connect'
    )
    const bldUnityRenderer = path.dirname(
      require.resolve('@beland/unity-renderer/package.json', {
        paths: [workDir, ecsPath]
      })
    )
    const lambdasPath = path.resolve(exportDir, 'lambdas')
    const explorePath = path.resolve(lambdasPath, 'explore')
    const contractsPath = path.resolve(lambdasPath, 'contracts')
    const sceneContentPath = path.resolve(exportDir, 'content', 'entities')
    const contentsContentPath = path.resolve(exportDir, 'content', 'contents')
    const sceneJsonPath = path.resolve(workDir, './scene.json')

    // 2) Change HTML title name
    const defaultSceneJson = {
      display: { title: '' },
      scene: { parcels: ['0,0'] }
    }
    const sceneJson = fs.existsSync(sceneJsonPath)
      ? JSON.parse(fs.readFileSync(sceneJsonPath).toString())
      : defaultSceneJson

    const content = await fs.promises.readFile(
      path.resolve(bldKernelPath, 'export.html'),
      'utf-8'
    )
    const finalContent = content
      .replace('{{ scene.display.title }}', sceneJson.display.title)
      .replace('{{ scene.scene.base }}', sceneJson.scene.base)

    // 3) Copy and write files
    await ensureWriteFile(
      path.resolve(explorePath, 'realms'),
      JSON.stringify([
        {
          serverName: 'localhost',
          url: `http://localhost`,
          layer: 'stub',
          usersCount: 0,
          maxUsers: 100,
          userParcels: []
        }
      ])
    )

    await ensureWriteFile(
      path.resolve(contractsPath, 'servers'),
      JSON.stringify([
        {
          address: `http://localhost`,
          owner: '0x0000000000000000000000000000000000000000',
          id: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }
      ])
    )

    await ensureWriteFile(path.resolve(contractsPath, 'pois'), '')

    await ensureWriteFile(
      path.resolve(sceneContentPath, 'scene'),
      JSON.stringify(
        getSceneJson({
          baseFolders: [workDir],
          pointers: sceneJson?.scene?.parcels || ['0,0'],
          customHashMaker: shaHashMaker
        })
      )
    )

    await ensureWriteFile(
      path.resolve(lambdasPath, 'profiles'),
      JSON.stringify([])
    )

    let ignoreFileContent = ''
    if (fs.existsSync(bldIgnorePath)) {
      ignoreFileContent = fs.readFileSync(
        path.resolve(workDir, '.bldignore'),
        'utf-8'
      )
    }
    const contentStatic = entityFromFolder({
      folder: workDir,
      addOriginalPath: true,
      ignorePattern: ignoreFileContent,
      customHashMaker: shaHashMaker
    })
    if (contentStatic?.contents) {
      for (const $ of contentStatic?.contents) {
        if ($ && $.original_path) {
          await ensureCopyFile(
            path.resolve(workDir, $.original_path),
            path.resolve(contentsContentPath, $.hash)
          )
        }
      }
    }

    await Promise.all([
      // copy project
      ensureWriteFile(path.resolve(exportDir, 'index.html'), finalContent),
      ensureWriteFile(
        path.resolve(exportDir, 'mappings'),
        JSON.stringify(mappings)
      ),
      ensureCopyFile(
        path.resolve(bldKernelPath, 'index.js'),
        path.resolve(exportDir, 'index.js')
      ),
      ensureCopyFile(
        path.resolve(bldKernelPath, 'favicon.ico'),
        path.resolve(exportDir, 'favicon.ico')
      ),

      // copy dependencies
      copyDir(bldUnityRenderer, path.resolve(exportDir, 'unity-renderer')),
      copyDir(
        bldKernelDefaultProfilePath,
        path.resolve(exportDir, 'default-profile')
      ),
      copyDir(bldKernelLoaderPath, path.resolve(exportDir, 'loader'))
    ])

    if (fs.existsSync(bldKernelImagesBelandConnectPath)) {
      await copyDir(
        bldKernelImagesBelandConnectPath,
        path.resolve(exportDir, 'images', 'beland-connect')
      )
    }

    const copyBrVersion = [
      'unity.wasm',
      'unity.data',
      'unity.framework.js',
      'unity.data'
    ]
    for (const fileName of copyBrVersion) {
      if (fs.existsSync(path.resolve(exportDir, 'unity-renderer', fileName))) {
        await ensureCopyFile(
          path.resolve(exportDir, 'unity-renderer', fileName),
          path.resolve(exportDir, 'unity-renderer', `${fileName}.br`)
        )
      }
    }

    // await copyWearables({ exportDir })
    await ensureWriteFile(
      path.resolve(exportDir, 'content', 'available-content'),
      '[{"cid":"0","available":false}]'
    )
  } catch (err) {
    console.error('Export failed.', err)
    throw err
  }
  return
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export = setupExport
