# Use explicit version of node, not LTS
from node:14.17.3

# Create a non-priviliged user to run the process (server.js).
# The code should be owned by root, not world-writable, but run as the non-root user.
RUN useradd -ms /bin/bash appuser && mkdir /code && chown -R appuser /code

# Dependencies are less likely to change than app code
# and are slow to install so create layers relating to npm early
# and the actual app code which will change frequently later.
COPY package.json /code/
WORKDIR /code
RUN npm install

COPY server.js film.js vault.js /code/

# Run the main process as the less priviliged user.
USER appuser
CMD ["node", "server.js"]
