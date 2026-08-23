function CandidateCard({
  candidate,
  disabled,
  onVote,
}) {
  return (
    <div className="candidate-card">

      <div className="candidate-photo">

        {candidate.photo ? (
          <img
            src={candidate.photo}
            alt={candidate.name}
          />
        ) : (
          <div className="default-avatar">
            {candidate.name
              ?.charAt(0)
              .toUpperCase()}
          </div>
        )}

      </div>

      <div className="candidate-info">

        <h3>{candidate.name}</h3>

        <p className="party">
          {candidate.party}
        </p>

        <div className="candidate-bottom">

          
          <button
            disabled={disabled}
            onClick={() =>
              onVote(candidate._id)
            }
          >
            {disabled
              ? "Vote Submitted"
              : "Vote Now"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CandidateCard;