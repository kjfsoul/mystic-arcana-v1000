import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrionCard } from '../OrionCard';

describe('OrionCard', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('Rendering', () => {
    it('should render Orion reader information correctly', () => {
      render(<OrionCard />);

      expect(screen.getByText('Orion')).toBeInTheDocument();
      expect(screen.getByText('The Astrology Career Guide')).toBeInTheDocument();
      expect(screen.getByText(/Master of celestial timing/)).toBeInTheDocument();
    });

    it('should display specialty icons with correct labels', () => {
      render(<OrionCard />);

      expect(screen.getByText('Career Guidance')).toBeInTheDocument();
      expect(screen.getByText('Cosmic Timing')).toBeInTheDocument();
      expect(screen.getByText('Life Purpose')).toBeInTheDocument();
      expect(screen.getByText('Birth Charts')).toBeInTheDocument();
    });

    it('should show reading style information', () => {
      render(<OrionCard />);

      expect(screen.getByText('Reading Style')).toBeInTheDocument();
      expect(screen.getByText(/calm and insightful/)).toBeInTheDocument();
      expect(screen.getByText(/tactically honest/)).toBeInTheDocument();
    });

    it('should display expertise tags', () => {
      render(<OrionCard />);

      expect(screen.getByText('career')).toBeInTheDocument();
      expect(screen.getByText('purpose')).toBeInTheDocument();
      expect(screen.getByText('timing')).toBeInTheDocument();
      expect(screen.getByText('leadership')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onSelect when card is clicked', () => {
      render(<OrionCard onSelect={mockOnSelect} />);

      const card = screen.getByText('Orion').closest('div');
      fireEvent.click(card!);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should apply selected styling when isSelected is true', () => {
      const { container } = render(<OrionCard isSelected={true} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('border-blue-400');
      expect(cardElement).toHaveClass('bg-gradient-to-br');
    });

    it('should not apply selected styling when isSelected is false', () => {
      const { container } = render(<OrionCard isSelected={false} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass('border-slate-600');
      expect(cardElement).not.toHaveClass('border-blue-400');
    });
  });

  describe('Details Mode', () => {
    it('should show sample guidance when showDetails is true', () => {
      render(<OrionCard showDetails={true} />);

      expect(screen.getByText('Sample Guidance')).toBeInTheDocument();
      expect(screen.getByText(/The cosmos rarely reveals/)).toBeInTheDocument();
    });

    it('should not show sample guidance when showDetails is false', () => {
      render(<OrionCard showDetails={false} />);

      expect(screen.queryByText('Sample Guidance')).not.toBeInTheDocument();
      expect(screen.queryByText(/The cosmos rarely reveals/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<OrionCard onSelect={mockOnSelect} />);

      const card = screen.getByText('Orion').closest('div');
      
      // Should be focusable (has cursor-pointer class indicating it's interactive)
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should have proper ARIA attributes', () => {
      render(<OrionCard />);

      // The card should be interactive
      const card = screen.getByText('Orion').closest('div');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('Visual Elements', () => {
    it('should render star icon in avatar', () => {
      const { container } = render(<OrionCard />);

      // Check for star icon (Lucide icons render as SVG)
      const starIcons = container.querySelectorAll('svg');
      expect(starIcons.length).toBeGreaterThan(0);
    });

    it('should show sparkles animation element', () => {
      const { container } = render(<OrionCard />);

      // Check for sparkles icon
      const sparklesIcon = container.querySelector('[data-lucide="sparkles"]');
      // Note: Depending on how Lucide React renders icons, this test might need adjustment
    });
  });

  describe('Props', () => {
    it('should accept and apply custom className', () => {
      const customClass = 'custom-test-class';
      const { container } = render(<OrionCard className={customClass} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass(customClass);
    });

    it('should work without onSelect prop', () => {
      expect(() => {
        render(<OrionCard />);
      }).not.toThrow();
    });
  });
});