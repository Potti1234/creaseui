import './styles.css'
import { Runtime } from 'foldkit'
import { Model, Flags, flags, init, update, subscriptions } from './model'
import { view } from './view'

Runtime.run(
  Runtime.makeElement({
    Model,
    Flags,
    flags,
    init,
    update,
    view,
    subscriptions,
    container: document.getElementById('root'),
    devTools: false,
  }),
)
