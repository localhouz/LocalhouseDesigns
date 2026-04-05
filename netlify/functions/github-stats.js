exports.handler = async function () {
  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GITHUB_TOKEN environment variable is not set.' }) };
  }

  const query = `{
    viewer {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      repositories(
        first: 50
        orderBy: { field: UPDATED_AT, direction: DESC }
        ownerAffiliations: [OWNER]
      ) {
        nodes {
          name
          description
          url
          openGraphImageUrl
          usesCustomOpenGraphImage
          primaryLanguage { name color }
          defaultBranchRef {
            target {
              ... on Commit {
                history { totalCount }
              }
            }
          }
          updatedAt
          createdAt
          diskUsage
          issues { totalCount }
          repositoryTopics(first: 10) {
            nodes { topic { name } }
          }
          languages(first: 5, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name color } }
            totalSize
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 0) { totalCount }
                historyByWeek: history(first: 52) {
                  nodes { committedDate }
                }
              }
            }
          }
        }
      }
    }
  }`;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(json.data?.viewer ?? {}),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
