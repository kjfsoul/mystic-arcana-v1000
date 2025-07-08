import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, Arrow
import numpy as np

# Create figure for gamification flow
fig, ax = plt.subplots(1, 1, figsize=(14, 10))
ax.set_xlim(0, 14)
ax.set_ylim(0, 10)
ax.axis('off')

# Define engagement activities and their unlocks
engagement_flow = [
    {
        'activity': 'Join Reading Group',
        'points': '10 pts',
        'unlock': 'Basic Animal Persona',
        'color': '#FF6B6B',
        'x': 2, 'y': 8
    },
    {
        'activity': 'Share Book Review',
        'points': '25 pts', 
        'unlock': 'Custom Theme Pack',
        'color': '#4ECDC4',
        'x': 6, 'y': 8
    },
    {
        'activity': 'Host Group Reading',
        'points': '50 pts',
        'unlock': 'Planet Persona',
        'color': '#45B7D1', 
        'x': 10, 'y': 8
    },
    {
        'activity': 'Weekly Reading Streak',
        'points': '15 pts/week',
        'unlock': 'Advanced Layouts',
        'color': '#96CEB4',
        'x': 2, 'y': 5
    },
    {
        'activity': 'Community Event',
        'points': '75 pts',
        'unlock': 'Legendary Persona',
        'color': '#FECA57',
        'x': 6, 'y': 5
    },
    {
        'activity': 'Reading Mentor',
        'points': '100 pts',
        'unlock': 'All Features',
        'color': '#FF9FF3',
        'x': 10, 'y': 5
    }
]

# Badge levels
badge_levels = [
    {'name': 'Bronze', 'threshold': '0-100 pts', 'color': '#CD7F32', 'y': 2.5},
    {'name': 'Silver', 'threshold': '100-300 pts', 'color': '#C0C0C0', 'y': 2.5}, 
    {'name': 'Gold', 'threshold': '300-600 pts', 'color': '#FFD700', 'y': 2.5},
    {'name': 'Platinum', 'threshold': '600+ pts', 'color': '#E5E4E2', 'y': 2.5}
]

# Title
ax.text(7, 9.5, 'Community Engagement → Gamification Unlocks', 
        fontsize=18, fontweight='bold', ha='center', va='center')

# Draw engagement activities
for activity in engagement_flow:
    # Activity box
    activity_box = FancyBboxPatch(
        (activity['x']-1, activity['y']-0.4), 2, 0.8,
        boxstyle="round,pad=0.05",
        facecolor=activity['color'],
        alpha=0.3,
        edgecolor=activity['color'],
        linewidth=2
    )
    ax.add_patch(activity_box)
    
    # Activity text
    ax.text(activity['x'], activity['y']+0.1, activity['activity'], 
            fontsize=10, fontweight='bold', ha='center', va='center')
    ax.text(activity['x'], activity['y']-0.1, activity['points'], 
            fontsize=9, ha='center', va='center', style='italic')
    
    # Arrow pointing down
    ax.annotate('', xy=(activity['x'], activity['y']-0.8), 
                xytext=(activity['x'], activity['y']-0.4),
                arrowprops=dict(arrowstyle='->', lw=2, color=activity['color']))
    
    # Unlock box
    unlock_box = FancyBboxPatch(
        (activity['x']-1, activity['y']-1.6), 2, 0.6,
        boxstyle="round,pad=0.05",
        facecolor='white',
        edgecolor=activity['color'],
        linewidth=2
    )
    ax.add_patch(unlock_box)
    
    ax.text(activity['x'], activity['y']-1.3, 'Unlocks:', 
            fontsize=8, ha='center', va='center', style='italic')
    ax.text(activity['x'], activity['y']-1.5, activity['unlock'], 
            fontsize=9, fontweight='bold', ha='center', va='center')

# Badge progression
ax.text(7, 3.2, 'Badge Progression System', 
        fontsize=14, fontweight='bold', ha='center', va='center')

# Draw badge levels
badge_width = 2.5
start_x = 2.5
for i, badge in enumerate(badge_levels):
    x = start_x + i * badge_width
    
    # Badge circle
    badge_circle = Circle((x, badge['y']), 0.3, 
                         facecolor=badge['color'], 
                         edgecolor='black', linewidth=2)
    ax.add_patch(badge_circle)
    
    # Badge text
    ax.text(x, badge['y']+0.6, badge['name'], 
            fontsize=11, fontweight='bold', ha='center', va='center')
    ax.text(x, badge['y']-0.6, badge['threshold'], 
            fontsize=9, ha='center', va='center')
    
    # Arrow to next level
    if i < len(badge_levels) - 1:
        ax.annotate('', xy=(x + badge_width/2 - 0.2, badge['y']), 
                    xytext=(x + 0.3, badge['y']),
                    arrowprops=dict(arrowstyle='->', lw=2, color='gray'))

# Community milestones
ax.text(7, 1.2, 'Community Milestones unlock special events and rewards', 
        fontsize=12, ha='center', va='center', style='italic',
        bbox=dict(boxstyle="round,pad=0.3", facecolor='lightblue', alpha=0.3))

plt.tight_layout()
plt.savefig('gamification_flow.png', dpi=300, bbox_inches='tight')
plt.show()