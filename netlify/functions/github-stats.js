// Netlify serverless function — GITHUB_TOKEN lives here, never in the browser bundle
exports.handler = async function () {
  const token = process.env['GITHUB_TOKEN'];

  if (!token) {
    // Debug: list available env var keys (no values) to help diagnose
    const keys = Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('TOKEN')).sort();
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'GITHUB_TOKEN environment variable is not set.',
        availableKeys: keys,
      }),
    };
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
          primaryLanguage { name color }
          defaultBranchRef {
            target {
              ... on Commit {
                history { totalCount }
              }
            }
          }
          updatedAt
        }
      }
    }
  }`;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`);

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(json.data?.viewer ?? {}),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
