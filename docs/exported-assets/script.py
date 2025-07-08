import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import numpy as np

# Create figure and axis
fig, ax = plt.subplots(1, 1, figsize=(16, 12))
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

# Define colors for each layer
colors = {
    'User Layer': '#FF6B6B',
    'Frontend Layer': '#4ECDC4', 
    'Community Features': '#45B7D1',
    'Gamification Engine': '#96CEB4',
    'Content Management': '#FECA57',
    'Analytics & AI': '#FF9FF3',
    'Backend Services': '#54A0FF',
    'Data Layer': '#5F27CD'
}

# Define layer positions and components
layers = [
    {
        'name': 'User Layer',
        'y': 9,
        'components': ['Readers', 'Moderators', 'Authors', 'Book Clubs']
    },
    {
        'name': 'Frontend Layer',
        'y': 8,
        'components': ['Web App', 'Mobile App', 'Dashboard', 'Portal']
    },
    {
        'name': 'Community Features',
        'y': 7,
        'components': ['Group Reading', 'Forums', 'Events', 'Sharing']
    },
    {
        'name': 'Gamification Engine',
        'y': 6,
        'components': ['Badges', 'Personas', 'Progress', 'Achievements']
    },
    {
        'name': 'Content Management',
        'y': 5,
        'components': ['Books', 'Themes', 'Spreads', 'User Content']
    },
    {
        'name': 'Analytics & AI',
        'y': 4,
        'components': ['Analytics', 'Recommendations', 'Insights', 'ML Models']
    },
    {
        'name': 'Backend Services',
        'y': 3,
        'components': ['User Mgmt', 'Auth', 'CDN', 'Notifications']
    },
    {
        'name': 'Data Layer',
        'y': 2,
        'components': ['User DB', 'Reading Data', 'Community', 'Analytics DB']
    }
]

# Draw layers and components
for layer in layers:
    # Draw layer background
    layer_rect = FancyBboxPatch(
        (0.5, layer['y']-0.4), 9, 0.8,
        boxstyle="round,pad=0.02",
        facecolor=colors[layer['name']],
        alpha=0.3,
        edgecolor=colors[layer['name']],
        linewidth=2
    )
    ax.add_patch(layer_rect)
    
    # Add layer name
    ax.text(0.2, layer['y'], layer['name'], fontsize=12, fontweight='bold', 
            va='center', ha='left', color=colors[layer['name']])
    
    # Add components
    comp_width = 2.0
    start_x = 1.0
    for i, comp in enumerate(layer['components']):
        x = start_x + i * comp_width
        comp_rect = FancyBboxPatch(
            (x, layer['y']-0.25), comp_width-0.1, 0.5,
            boxstyle="round,pad=0.02",
            facecolor='white',
            edgecolor=colors[layer['name']],
            linewidth=1.5
        )
        ax.add_patch(comp_rect)
        
        ax.text(x + (comp_width-0.1)/2, layer['y'], comp, 
                fontsize=9, ha='center', va='center', wrap=True)

# Add arrows to show data flow
arrow_props = dict(arrowstyle='->', lw=2, color='gray', alpha=0.7)

# Vertical arrows between layers
for i in range(len(layers)-1):
    ax.annotate('', xy=(5, layers[i+1]['y']+0.4), xytext=(5, layers[i]['y']-0.4),
                arrowprops=arrow_props)

# Title
ax.text(5, 9.7, 'Community Reading Platform - System Architecture', 
        fontsize=18, fontweight='bold', ha='center', va='center')

# Legend
legend_x = 0.5
legend_y = 0.8
ax.text(legend_x, legend_y, 'Data Flow:', fontsize=10, fontweight='bold')
ax.annotate('', xy=(legend_x+1.5, legend_y), xytext=(legend_x+0.5, legend_y),
            arrowprops=dict(arrowstyle='->', lw=2, color='gray'))

plt.tight_layout()
plt.savefig('system_architecture.png', dpi=300, bbox_inches='tight')
plt.show()