
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import ReportedPostsList from '../ReportedPostsList';
import { ReportedPost } from '@/types/database/moderation.types';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock data
const mockReportedPosts: ReportedPost[] = [
  {
    post_id: '1',
    count: 5,
    posts: {
      id: '1',
      content: 'Test post content',
      user_id: 'user-1',
      media_url: null,
      media_type: null,
      created_at: '2023-01-01T00:00:00.000Z',
      profiles: {
        username: 'testuser',
        avatar_url: null
      }
    }
  },
  {
    post_id: '2',
    count: 3,
    posts: {
      id: '2',
      content: 'Another test post',
      user_id: 'user-2',
      media_url: null,
      media_type: null,
      created_at: '2023-01-02T00:00:00.000Z',
      profiles: {
        username: 'anotheruser',
        avatar_url: null
      }
    }
  }
];

// Fix jest-dom mock
jest.mock('@testing-library/jest-dom', () => {
  const actual = jest.requireActual('@testing-library/jest-dom');
  // Add the missing toBeInTheDocument matcher
  return {
    ...actual,
    // This is a simplified implementation just to make TypeScript happy
    // The real implementation will be provided by the actual jest-dom
  };
});

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

describe('ReportedPostsList', () => {
  it('should render the list of reported posts', () => {
    render(
      <ReportedPostsList 
        reportedPosts={mockReportedPosts}
        selectedPost={null}
        onSelectPost={jest.fn()}
        isLoading={false}
      />
    );
    
    // Check if the list shows the correct usernames and report counts
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('@anotheruser')).toBeInTheDocument();
    
    // Check if report counts are displayed
    expect(screen.getByText('5 reportes')).toBeInTheDocument();
    expect(screen.getByText('3 reportes')).toBeInTheDocument();
  });
  
  it('should call onSelectPost when a post is clicked', async () => {
    const mockOnSelectPost = jest.fn();
    
    render(
      <ReportedPostsList 
        reportedPosts={mockReportedPosts}
        selectedPost={null}
        onSelectPost={mockOnSelectPost}
        isLoading={false}
      />
    );
    
    const post = screen.getByText('@testuser').closest('div[role="button"]');
    if (post) {
      await userEvent.click(post);
    }
    
    expect(mockOnSelectPost).toHaveBeenCalledWith('1');
  });
  
  it('should show loading state when isLoading is true', () => {
    render(
      <ReportedPostsList 
        reportedPosts={[]}
        selectedPost={null}
        onSelectPost={jest.fn()}
        isLoading={true}
      />
    );
    
    expect(screen.getByText('Cargando publicaciones reportadas...')).toBeInTheDocument();
  });
  
  it('should show empty state when there are no reported posts', () => {
    render(
      <ReportedPostsList 
        reportedPosts={[]}
        selectedPost={null}
        onSelectPost={jest.fn()}
        isLoading={false}
      />
    );
    
    expect(screen.getByText('No hay publicaciones reportadas')).toBeInTheDocument();
  });
});
