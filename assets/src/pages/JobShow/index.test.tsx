import { render } from '@testing-library/react'
import { describe, expect, test, vi, Mock } from 'vitest'
import JobShow from '.'
import { useParams } from 'react-router-dom'
import { useJob, useCandidates } from '../../hooks'
import { Candidate } from '../../api'

vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as object
  return {
    ...actual,
    useParams: vi.fn(),
  }
})

vi.mock('../../hooks', () => ({
  useJob: vi.fn(),
  useCandidates: vi.fn(),
}))

describe('JobShow component', () => {
  test('renders job name and candidates', () => {
    const jobId = '1'
    const job = { name: 'Test Job' }
    const candidates: Candidate[] = [
      { id: 1, email: 'candidate1@example.com', position: 1, status: 'new' },
      { id: 2, email: 'candidate2@example.com', position: 2, status: 'interview' },
      { id: 3, email: 'candidate3@example.com', position: 3, status: 'hired' },
      { id: 4, email: 'candidate4@example.com', position: 4, status: 'rejected' },
    ]

    // Mock the return values of the hooks
    ;(useParams as Mock).mockReturnValue({ jobId })
    ;(useJob as Mock).mockReturnValue({ job })
    ;(useCandidates as Mock).mockReturnValue({ candidates })

    const { getByText } = render(<JobShow />)

    expect(getByText('Test Job')).toBeInTheDocument()

    expect(getByText('candidate1@example.com')).toBeInTheDocument()
    expect(getByText('candidate2@example.com')).toBeInTheDocument()
    expect(getByText('candidate3@example.com')).toBeInTheDocument()
    expect(getByText('candidate4@example.com')).toBeInTheDocument()

    expect(getByText('new')).toBeInTheDocument()
    expect(getByText('interview')).toBeInTheDocument()
    expect(getByText('hired')).toBeInTheDocument()
    expect(getByText('rejected')).toBeInTheDocument()
  })
})
