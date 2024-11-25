defmodule Wttj.Candidates do
  @moduledoc """
  The Candidates context.
  """

  import Ecto.Query, warn: false
  alias Wttj.Repo

  alias Wttj.Candidates.Candidate

  @doc """
  Returns the list of candidates.

  ## Examples

      iex> list_candidates()
      [%Candidate{}, ...]

  """
  def list_candidates(job_id) do
    query = from c in Candidate, where: c.job_id == ^job_id
    Repo.all(query)
  end

  @doc """
  Gets a single candidate.

  Raises `Ecto.NoResultsError` if the Candidate does not exist.

  ## Examples

      iex> get_candidate!(123)
      %Candidate{}

      iex> get_candidate!(456)
      ** (Ecto.NoResultsError)

  """
  def get_candidate!(job_id, id), do: Repo.get_by!(Candidate, id: id, job_id: job_id)

  @doc """
  Creates a candidate.

  ## Examples

      iex> create_candidate(%{field: value})
      {:ok, %Candidate{}}

      iex> create_candidate(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_candidate(attrs \\ %{}) do
    %Candidate{}
    |> Candidate.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a candidate and resolves any position conflicts within the same job and status.

  When a candidate is moved to a new position, any other candidates in the same job and status
  with positions greater than or equal to the new position will have their positions incremented
  to maintain unique and sequential ordering.

  ## Examples

      iex> update_candidate(candidate, %{position: 1, status: "interview"})
      {:ok, %Candidate{}}

      iex> update_candidate(candidate, %{position: nil, status: "invalid_status"})
      {:error, %Ecto.Changeset{}}

      iex> update_candidate(candidate, %{email: nil})
      {:error, %Ecto.Changeset{}}

  """
  def update_candidate(%Candidate{} = candidate, attrs) do
    changeset = Candidate.changeset(candidate, attrs)

    if changeset.valid? do
      Repo.transaction(fn ->
        new_position = Map.get(attrs, "position")
        new_status = Map.get(attrs, "status")
        old_status = candidate.status
        old_position = candidate.position

        if new_position && old_position do
          # Temporarily remove the candidate from its current position
          from(c in Candidate,
            where:
              c.job_id == ^candidate.job_id and
                c.status == ^old_status and
                c.position > ^old_position
          )
          |> Repo.update_all(inc: [position: -1])

          # Adjust positions in the new column
          from(c in Candidate,
            where:
              c.job_id == ^candidate.job_id and
                c.status == ^new_status and
                c.position >= ^new_position
          )
          |> Repo.update_all(inc: [position: 1])
        end

        # Update the candidate's status and position
        Repo.update!(changeset)
      end)
    else
      {:error, changeset}
    end
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking candidate changes.

  ## Examples

      iex> change_candidate(candidate)
      %Ecto.Changeset{data: %Candidate{}}

  """
  def change_candidate(%Candidate{} = candidate, attrs \\ %{}) do
    Candidate.changeset(candidate, attrs)
  end
end
