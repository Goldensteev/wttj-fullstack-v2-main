import { fireEvent, render, within } from '@testing-library/react'
import { describe, expect, test, vi, Mock, beforeEach } from 'vitest'
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
  const jobId = '1'
  const job = { name: 'Test Job' }
  const candidates: Candidate[] = [
    { id: 1, email: 'candidate1@example.com', position: 0, status: 'new' },
    { id: 2, email: 'candidate2@example.com', position: 0, status: 'interview' },
    { id: 3, email: 'candidate3@example.com', position: 0, status: 'hired' },
    { id: 4, email: 'candidate4@example.com', position: 0, status: 'rejected' },
    { id: 5, email: 'candidate5@example.com', position: 1, status: 'rejected' },
    { id: 6, email: 'candidate6@example.com', position: 2, status: 'rejected' },
  ]

  beforeEach(() => {
    // Mock the return values of the hooks
    ;(useParams as Mock).mockReturnValue({ jobId })
    ;(useJob as Mock).mockReturnValue({ job })
    ;(useCandidates as Mock).mockReturnValue({ candidates })
  })

  test('renders job name and candidates', () => {
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

  test('renders job name and candidates in correct columns', () => {
    const { getByText, getByTestId } = render(<JobShow />)

    expect(getByText('Test Job')).toBeInTheDocument()

    const statuses = ['new', 'interview', 'hired', 'rejected']

    statuses.forEach(status => {
      const columnHeading = getByText(status)
      const columnElement = getByTestId(`column-${status}`)
      const { queryByText } = within(columnElement) // Within this column, check that the correct candidates are present
      const candidatesInStatus = candidates.filter(c => c.status === status)

      expect(columnHeading).toBeInTheDocument()

      candidatesInStatus.forEach(candidate => {
        expect(queryByText(candidate.email)).toBeInTheDocument()
      })

      const otherCandidates = candidates.filter(c => c.status !== status)
      otherCandidates.forEach(candidate => {
        expect(queryByText(candidate.email)).not.toBeInTheDocument()
      })
    })
  })

  test('allows reordering candidates within the same column via drag and drop', async () => {
    const { getByTestId } = render(<JobShow />)

    const columnElement = getByTestId('column-rejected')
    const { queryAllByTestId } = within(columnElement)

    const initialCandidates = queryAllByTestId(testId => testId.startsWith('candidate-item-'))

    expect(initialCandidates).toHaveLength(3)
    expect(initialCandidates[0]).toHaveTextContent('candidate4@example.com')
    expect(initialCandidates[1]).toHaveTextContent('candidate5@example.com')
    expect(initialCandidates[2]).toHaveTextContent('candidate6@example.com')

    const domCandidateElements = queryAllByTestId(testId => testId.startsWith('candidate-item-'))
    expect(domCandidateElements).toHaveLength(3)

    const draggableItem = domCandidateElements[0]
    const dropTarget = domCandidateElements[2]

    fireEvent.dragStart(draggableItem)
    fireEvent.dragEnter(dropTarget)
    fireEvent.dragOver(dropTarget)
    fireEvent.drop(dropTarget)

    const updatedDomCandidateElements = queryAllByTestId(testId =>
      testId.startsWith('candidate-item-')
    )

    expect(updatedDomCandidateElements).toHaveLength(3)
    expect(updatedDomCandidateElements[0]).toHaveTextContent('candidate5@example.com')
    expect(updatedDomCandidateElements[1]).toHaveTextContent('candidate4@example.com')
    expect(updatedDomCandidateElements[2]).toHaveTextContent('candidate6@example.com')
  })
})
