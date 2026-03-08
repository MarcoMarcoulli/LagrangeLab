export type DerivativeFunction<TState, TParameters> = (
  state: TState,
  parameters: TParameters
) => TState;

export type AddFunction<TState> = (a: TState, b: TState) => TState;

export type ScaleFunction<TState> = (state: TState, scalar: number) => TState;

/**
 * @brief Advances a dynamical system state by one time step using RK4.
 *
 * @param state Current state.
 * @param parameters Model parameters.
 * @param dt Time step.
 * @param computeDerivatives Function that computes the state derivatives.
 * @param add Function that sums two states.
 * @param scale Function that multiplies a state by a scalar.
 * @returns The state advanced by one RK4 step.
 */
export function rungeKutta4Step<TState, TParameters>(
  state: TState,
  parameters: TParameters,
  dt: number,
  computeDerivatives: DerivativeFunction<TState, TParameters>,
  add: AddFunction<TState>,
  scale: ScaleFunction<TState>
): TState {
  const k1 = computeDerivatives(state, parameters);

  const k2 = computeDerivatives(
    add(state, scale(k1, dt / 2)),
    parameters
  );

  const k3 = computeDerivatives(
    add(state, scale(k2, dt / 2)),
    parameters
  );

  const k4 = computeDerivatives(
    add(state, scale(k3, dt)),
    parameters
  );

  const weightedSum = add(
    add(k1, scale(k2, 2)),
    add(scale(k3, 2), k4)
  );

  return add(state, scale(weightedSum, dt / 6));
}