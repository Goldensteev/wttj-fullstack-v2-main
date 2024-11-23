import { useParams } from 'react-router-dom'
import { useJob, useCandidates } from '../../hooks'
import { Text } from '@welcome-ui/text'
import { Flex } from '@welcome-ui/flex'
import { Box } from '@welcome-ui/box'
import { useEffect, useState } from 'react'
import { Candidate } from '../../api'
import CandidateCard from '../../components/Candidate'
import { Badge } from '@welcome-ui/badge'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'

type Statuses = 'new' | 'interview' | 'hired' | 'rejected'
const COLUMNS: Statuses[] = ['new', 'interview', 'hired', 'rejected']

interface SortedCandidates {
  new?: Candidate[]
  interview?: Candidate[]
  hired?: Candidate[]
  rejected?: Candidate[]
}

function JobShow() {
  const { jobId } = useParams()
  const { job } = useJob(jobId)
  const { candidates } = useCandidates(jobId)

  const [sortedCandidates, setSortedCandidates] = useState<SortedCandidates>({})

  useEffect(() => {
    if (candidates) {
      const sorted = candidates.reduce<SortedCandidates>((acc, c: Candidate) => {
        acc[c.status] = [...(acc[c.status] || []), c].sort((a, b) => a.position - b.position)
        return acc
      }, {})
      setSortedCandidates(sorted)
    }
  }, [candidates])

  const onDragEnd = (result: any) => {
    const { source, destination } = result

    if (!destination) return

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const column = source.droppableId as Statuses
    const updatedColumn = Array.from(sortedCandidates[column] || [])
    const [movedItem] = updatedColumn.splice(source.index, 1)
    updatedColumn.splice(destination.index, 0, movedItem)

    setSortedCandidates(prev => ({
      ...prev,
      [column]: updatedColumn,
    }))
  }

  return (
    <>
      <Box backgroundColor="neutral-70" p={20} alignItems="center">
        <Text variant="h5" color="white" m={0}>
          {job?.name}
        </Text>
      </Box>

      <Box p={20}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Flex gap={10}>
            {COLUMNS.map(column => (
              <Box
                key={column}
                w={300}
                border={1}
                backgroundColor="white"
                borderColor="neutral-30"
                borderRadius="md"
                overflow="hidden"
              >
                <Flex
                  p={10}
                  borderBottom={1}
                  borderColor="neutral-30"
                  alignItems="center"
                  justify="space-between"
                >
                  <Text color="black" m={0} textTransform="capitalize">
                    {column}
                  </Text>
                  <Badge>{(sortedCandidates[column] || []).length}</Badge>
                </Flex>
                <Droppable droppableId={column}>
                  {provided => (
                    <Flex
                      direction="column"
                      p={10}
                      pb={0}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {(sortedCandidates[column] || []).map((candidate, index) => (
                        <Draggable
                          key={candidate.id.toString()}
                          draggableId={candidate.id.toString()}
                          index={index}
                        >
                          {provided => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <CandidateCard candidate={candidate} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Flex>
                  )}
                </Droppable>
              </Box>
            ))}
          </Flex>
        </DragDropContext>
      </Box>
    </>
  )
}

export default JobShow
