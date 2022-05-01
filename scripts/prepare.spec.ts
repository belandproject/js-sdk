import {
  flow,
  commonChecks,
  ECS_PATH,
  BUILD_ECS_PATH,
  BELAND_AMD_PATH,
  ROLLUP_CONFIG_PATH,
  LEGACY_ECS_PATH
} from './common'
import {
  itExecutes,
  itInstallsADependencyFromFolderAndCopiesTheVersion
} from './helpers'

flow('build-all', () => {
  commonChecks()

  flow('beland-ecs', () => {
    // update dependencies versions and link packages
    itInstallsADependencyFromFolderAndCopiesTheVersion(ECS_PATH, BUILD_ECS_PATH)
    itInstallsADependencyFromFolderAndCopiesTheVersion(
      ECS_PATH,
      BELAND_AMD_PATH
    )
  })

  flow('pack every package', () => {
    itExecutes('npm pack', ECS_PATH)
    itExecutes('npm pack', LEGACY_ECS_PATH)
    itExecutes('npm pack', BELAND_AMD_PATH)
    itExecutes('npm pack', ROLLUP_CONFIG_PATH)
    itExecutes('npm pack', BUILD_ECS_PATH)
  })
})
