import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Load .env file for serverless functions in development
function loadEnvForServerless(mode: string) {
  if (mode === "development") {
    const envPath = path.resolve(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split("\n").forEach((line) => {
        const match = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
        if (match) {
          const key = match[1];
          const value = match[2].trim().replace(/^["']|["']$/g, "");
          process.env[key] = value;
        }
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables for serverless functions
  loadEnvForServerless(mode);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      mode === "development" && {
        name: "vercel-api-dev",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith("/api/")) {
              try {
                const apiPath = req.url.replace("/api/", "");
                const handler = await import(`./api/${apiPath.replace(/\?.*$/, "")}.ts`);

                let body = "";
                req.on("data", (chunk) => {
                  body += chunk.toString();
                });

                req.on("end", async () => {
                  const mockReq = {
                    method: req.method,
                    headers: req.headers,
                    body: body ? JSON.parse(body) : undefined,
                    url: req.url,
                  };

                  const mockRes = {
                    statusCode: 200,
                    headers: {} as Record<string, string>,
                    setHeader(key: string, value: string) {
                      this.headers[key] = value;
                    },
                    status(code: number) {
                      this.statusCode = code;
                      return this;
                    },
                    json(data: any) {
                      res.statusCode = this.statusCode;
                      Object.entries(this.headers).forEach(([key, value]) => {
                        res.setHeader(key, value);
                      });
                      res.setHeader("Content-Type", "application/json");
                      res.end(JSON.stringify(data));
                    },
                    end() {
                      res.end();
                    }
                  };

                  await handler.default(mockReq as any, mockRes as any);
                });
              } catch (error) {
                console.error("API Error:", error);
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Internal Server Error" }));
              }
            } else {
              next();
            }
          });
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
