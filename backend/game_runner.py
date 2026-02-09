import sys
import os

GENERALS_BOTS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../generals-bots'))
if GENERALS_BOTS_PATH not in sys.path:
    sys.path.insert(0, GENERALS_BOTS_PATH)

import jax
import jax.numpy as jnp
import jax.random as jrandom
import equinox as eqx
import numpy as np
from typing import Optional, List, Dict, Any

from generals import GeneralsEnv, get_observation
from generals.agents import Agent, RandomAgent, ExpanderAgent
from generals.core.observation import Observation
from generals.core.action import compute_valid_move_mask


class PPOAgentLoader:
    def __init__(self, model_path: str, grid_size: int = 8, agent_id: str = "PPOBot"):
        self.id = agent_id
        self.grid_size = grid_size
        
        from network import PolicyValueNetwork, obs_to_array
        self.obs_to_array = obs_to_array
        
        key = jax.random.PRNGKey(0)
        self.model = PolicyValueNetwork(key, grid_size=grid_size)
        
        self.model = eqx.tree_deserialise_leaves(model_path, self.model)
    
    def act(self, observation: Observation, key: jnp.ndarray) -> jnp.ndarray:
        obs_arr = self.obs_to_array(observation)
        
        mask = compute_valid_move_mask(
            observation.armies,
            observation.owned_cells,
            observation.mountains
        )
        
        action, _, _, _ = self.model(obs_arr, mask, key)
        return action
    
    def reset(self):
        pass


def create_agent(agent_type: str, model_path: Optional[str], grid_size: int, agent_id: str) -> Agent:
    if agent_type == 'ppo':
        if not model_path:
            raise ValueError("PPO agent requires a model path")
        return PPOAgentLoader(model_path, grid_size=grid_size, agent_id=agent_id)
    elif agent_type == 'expander':
        agent = ExpanderAgent(id=agent_id)
        return agent
    elif agent_type == 'random':
        agent = RandomAgent(id=agent_id)
        return agent
    else:
        raise ValueError(f"Unknown agent type: {agent_type}")


def state_to_frame(state, info, agents: List[str], turn: int) -> Dict[str, Any]:
    return {
        'turn': turn,
        'armies': np.array(state.armies).tolist(),
        'ownership': [np.array(state.ownership[i]).tolist() for i in range(2)],
        'generals': np.array(state.generals).tolist(),
        'cities': np.array(state.cities).tolist(),
        'mountains': np.array(state.mountains).tolist(),
        'general_positions': np.array(state.general_positions).tolist(),
        'stats': {
            agents[0]: {
                'army': int(info.army[0]),
                'land': int(info.land[0])
            },
            agents[1]: {
                'army': int(info.army[1]),
                'land': int(info.land[1])
            }
        },
        'winner': int(info.winner) if info.is_done else -1,
        'is_done': bool(info.is_done)
    }


def run_simulation(
    agent_0_type: str,
    agent_1_type: str,
    model_0_path: Optional[str],
    model_1_path: Optional[str],
    grid_size: int = 8,
    max_turns: int = 500,
    seed: int = 42
) -> Dict[str, Any]:
    env = GeneralsEnv(
        grid_dims=(grid_size, grid_size),
        truncation=max_turns,
        mountain_density=0.15,
        num_cities_range=(0, 2),
        min_generals_distance=max(3, grid_size // 2)
    )
    
    agent_0_name = f"Agent 0 ({agent_0_type.upper()})"
    agent_1_name = f"Agent 1 ({agent_1_type.upper()})"
    
    agent_0 = create_agent(agent_0_type, model_0_path, grid_size, agent_0_name)
    agent_1 = create_agent(agent_1_type, model_1_path, grid_size, agent_1_name)
    
    agents = [agent_0_name, agent_1_name]
    
    key = jrandom.PRNGKey(seed)
    state = env.reset(key)
    
    from generals.core.game import get_info
    info = get_info(state)
    
    frames = [state_to_frame(state, info, agents, 0)]
    
    terminated = False
    truncated = False
    turn = 0
    
    while not (terminated or truncated):
        obs_0 = get_observation(state, 0)
        obs_1 = get_observation(state, 1)
        
        key, k1, k2 = jrandom.split(key, 3)
        action_0 = agent_0.act(obs_0, k1)
        action_1 = agent_1.act(obs_1, k2)
        actions = jnp.stack([action_0, action_1])
        
        key, step_key = jrandom.split(key)
        timestep, state = env.step(state, actions, step_key)
        
        turn += 1
        info = timestep.info
        
        frames.append(state_to_frame(state, info, agents, turn))
        
        terminated = bool(timestep.terminated)
        truncated = bool(timestep.truncated)
    
    winner_idx = int(info.winner) if info.winner >= 0 else -1
    winner_name = agents[winner_idx] if winner_idx >= 0 else "Draw"
    
    return {
        'frames': frames,
        'total_turns': turn,
        'winner': winner_name,
        'winner_idx': winner_idx,
        'agents': agents,
        'grid_size': grid_size
    }
