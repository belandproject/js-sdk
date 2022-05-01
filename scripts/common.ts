import { resolve } from 'path'
import { ensureFileExists, readJson } from './helpers'

export const flow = describe

// TOOLS
export const TSC = resolve(process.cwd(), './node_modules/typescript/bin/tsc')
export const TERSER = resolve(
  process.cwd(),
  './packages/@beland/beland-rollup/node_modules/.bin/terser'
)
export const ROLLUP = resolve(
  process.cwd(),
  './packages/@beland/beland-rollup/node_modules/.bin/rollup'
)

// WORKING DIRECTORIES
export const BUILD_ECS_PATH = resolve(
  process.cwd(),
  './packages/@beland/build-ecs'
)
export const BELAND_AMD_PATH = resolve(process.cwd(), './packages/@beland/amd')
export const ROLLUP_CONFIG_PATH = resolve(
  process.cwd(),
  './packages/@beland/beland-rollup'
)
export const ECS_PATH = resolve(process.cwd(), './packages/beland-ecs')
export const LEGACY_ECS_PATH = resolve(
  process.cwd(),
  './packages/@beland/legacy-ecs'
)

export function commonChecks() {
  test('tooling is installed', () => {
    ensureFileExists(TSC)
    ensureFileExists(TERSER)
    ensureFileExists(ROLLUP)
  })

  test('@beland/posix is consistent across projects', () => {
    const ecsVersion = readJson('package.json', ECS_PATH).dependencies[
      '@beland/posix'
    ]
    const amdVersion = readJson('package.json', BELAND_AMD_PATH)
      .devDependencies['@beland/posix']

    expect(amdVersion).toEqual(ecsVersion)
  })

  test('@beland/posix snapshot are not used for releases', () => {
    // we only validate ECS version, previous step validates consistenty
    const belandPosixVersion: string =
      readJson('package.json', ECS_PATH).dependencies['@beland/posix'] || ''

    const ref: string = (process.env.GITHUB_REF || '').split(/\//g).pop()!

    const snapshotExpr = /-/ // if it contains a dash, it is a snapshot

    // in releases, we fail right here
    if (/^\d+\.\d+\.\d+.*/.test(ref)) {
      expect(belandPosixVersion).not.toMatch(snapshotExpr)
    }

    if (snapshotExpr.test(belandPosixVersion)) {
      console.error(
        `::error file=${resolve(
          ECS_PATH,
          'package.json'
        )},line=0,col=0::Using a snapshot version of @beland/posix if you create a release with the snapshot it will fail`
      )
    }
  })
}
