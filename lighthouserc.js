export default {
  ci: {
    collect: {
      staticDistDir: "./dist",
      numberOfRuns: 1,
      url: [
        "http://localhost/index.html",
        "http://localhost/blog/index.html",
        "http://localhost/projects/index.html",
        "http://localhost/publications/index.html"
      ]
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.6 }],
        "categories:accessibility": ["warn", { minScore: 0.7 }],
        "categories:best-practices": ["warn", { minScore: 0.7 }],
        "categories:seo": ["warn", { minScore: 0.8 }]
      }
    },
    upload: {
      target: "temporary-public-storage"
    }
  }
}
