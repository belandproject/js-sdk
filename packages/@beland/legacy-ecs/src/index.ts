// CORE DEPENDENCIES
export * from './ecs/Attachable'
export * from './ecs/Engine'
export * from './ecs/Component'
export * from './ecs/ComponentGroup'
export * from './ecs/Entity'
export * from './ecs/IEntity'
export * from './ecs/Task'
export * from './ecs/helpers'
export * from './ecs/Observable'
export * from './ecs/UIValue'
export * from './ecs/EventManager'
export * from './ecs/UserActions'

import { _initEventObservables } from './beland/Events'
import { BelandSynchronizationSystem } from './beland/Implementation'

// ECS INITIALIZATION
import { Engine } from './ecs/Engine'
import { Entity } from './ecs/Entity'

const entity = new Entity('scene')
;(entity as any).uuid = '0'

// Initialize engine
/** @public */
const engine = new Engine(entity)

import { DisposableComponent } from './ecs/Component'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
DisposableComponent.engine = engine

// Initialize Beland interface
if (typeof bld !== 'undefined') {
  engine.addSystem(new BelandSynchronizationSystem(bld), Infinity)
  _initEventObservables(bld)
}

import {
  uuidEventSystem,
  pointerEventSystem,
  raycastEventSystem
} from './beland/Systems'

// Initialize UUID Events system
engine.addSystem(uuidEventSystem)
// Initialize Pointer Events System
engine.addSystem(pointerEventSystem)
// Initialize Raycast Events System
engine.addSystem(raycastEventSystem)

// BELAND DEPENDENCIES
export * from './beland/Math'
export * from './beland/Types'
export * from './beland/Components'
export * from './beland/Systems'
export * from './beland/Events'
export * from './beland/Camera'
export * from './beland/AnimationState'
export * from './beland/Input'
export * from './beland/Audio'
export * from './beland/Gizmos'
export * from './beland/UIShapes'
export * from './beland/AvatarShape'
export * from './beland/UIEvents'
export * from './beland/MessageBus'
export * from './beland/PhysicsCast'

export { engine }
