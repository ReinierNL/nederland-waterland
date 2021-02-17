import m, { FactoryComponent } from 'mithril';
import Stream from 'mithril/stream';
import { merge } from '../utils/mergerino';
import { appStateMgmt, IAppStateActions, IAppStateModel } from './states';

export interface IAppModel extends IAppStateModel {}

export interface IActions extends IAppStateActions {}

export type ModelUpdateFunction = Partial<IAppModel> | any;

export type UpdateStream = Stream<ModelUpdateFunction>;

export type MeiosisComponent = FactoryComponent<{
  state: IAppModel;
  actions: IActions;
}>;

const app = {
  initial: Object.assign({}, appStateMgmt.initial) as IAppModel,
  actions: (update: UpdateStream, states: Stream<IAppModel>) =>
    Object.assign({}, appStateMgmt.actions(update, states)) as IActions,
};

const update = Stream<ModelUpdateFunction>();
export const states = Stream.scan(merge, app.initial, update);
export const actions = app.actions(update, states);

states.map(() => {
  m.redraw();
});
